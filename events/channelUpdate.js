module.exports = async (client, oldChannel, newChannel) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");
        const { LogChannels } = require('../database/dbServices/server.api');

        let logChannel = await LogChannels.findOne({ where: { server_id: newChannel.guild.id } });
        if (!logChannel) return;
        let log = newChannel.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        let botMember = newChannel.guild.members.me;

        if (log.permissionsFor(botMember).has(Discord.PermissionFlagsBits.SendMessages) && log.permissionsFor(botMember).has(Discord.PermissionFlagsBits.EmbedLinks)) {
            const fetchedLogs = await newChannel.guild.fetchAuditLogs({
                limit: 1,
                type: Discord.AuditLogEvent.ChannelUpdate
            });
            let updateLog = fetchedLogs.entries.first();
            if (updateLog && updateLog.createdTimestamp < (Date.now() - 5000)) updateLog = null;
            let executor;
            if (updateLog) {
                const { executor: createExecutor, target } = updateLog;
                if (target.id === newChannel.id) {
                    executor = createExecutor;
                };
            };

            const oldChannelType = oldChannel.constructor.name;
            const newChannelType = newChannel.constructor.name;

            let footer = newChannel.id;
            if (executor) footer = executor.username;
            let icon = newChannel.guild.iconURL(globalVars.displayAvatarSettings);

            const updateEmbed = new Discord.EmbedBuilder()
                .setColor(globalVars.embedColor)
                .setAuthor({ name: `${newChannelType} Updated ⚒️`, iconURL: icon })
                .addFields([{ name: `Channel:`, value: `${newChannel.name}\n${newChannel} (${newChannel.id})`, inline: false }])
                .setFooter({ text: footer })
                .setTimestamp();
            if (executor) updateEmbed.addFields([{ name: 'Updated By:', value: `${executor} (${executor.id})`, inline: false }]);
            if (oldChannel.name !== newChannel.name) {
                updateEmbed.addFields([
                    { name: `Old Name:`, value: oldChannel.name, inline: true },
                    { name: `New Name:`, value: newChannel.name, inline: true }
                ]);
            } else {
                // updateEmbed.addFields([{ name: 'Channel Name:', value: newChannel.name, inline: true }]);
            };
            if (oldChannel.type !== newChannel.type) {
                updateEmbed.addFields([
                    { name: `Old Type:`, value: oldChannelType, inline: true },
                    { name: `New Type:`, value: newChannelType, inline: true }
                ]);
            } else if (oldChannel.parentId !== newChannel.parentId) {
                updateEmbed.addFields([
                    { name: `Old Category:`, value: oldChannel.parent?.name || '(None)', inline: true },
                    { name: `New Category:`, value: newChannel.parent?.name || '(None)', inline: true }
                ]);
            };
            if ([Discord.ChannelType.GuildText, Discord.ChannelType.GuildNews, Discord.ChannelType.GuildStore].includes(newChannel.type)) {
                if (oldChannel.topic !== newChannel.topic) {
                    updateEmbed.addFields([
                        { name: `Old Topic:`, value: oldChannel.topic || '(None)', inline: true },
                        { name: `New Topic:`, value: newChannel.topic || '(None)', inline: true }
                    ]);
                } else if (oldChannel.nsfw !== newChannel.nsfw) {
                    updateEmbed.addFields([
                        { name: `Old Is NSFW:`, value: oldChannel.nsfw.toString(), inline: true },
                        { name: `New Is NSFW:`, value: newChannel.nsfw.toString(), inline: true }
                    ]);
                } else {
                    return;
                };
                // these will both be undefined on a GuildNews channel, since there is no rate limit there, possibly also for GuildStore channels
                let oldSlowmode = 0;
                let newSlowmode = 0;
                if (oldChannel.rateLimitPerUser) oldSlowmode = oldChannel.rateLimitPerUser;
                if (newChannel.rateLimitPerUser) newSlowmode = newChannel.rateLimitPerUser;
                if (oldSlowmode !== newSlowmode) {
                    updateEmbed.addFields([
                        { name: `Old Slowmode Timer:`, value: `${oldSlowmode} seconds`, inline: true },
                        { name: `New Slowmode Timer:`, value: `${newSlowmode} seconds`, inline: true }
                    ]);
                };
            } else if ([Discord.ChannelType.GuildVoice, Discord.ChannelType.GuildStageVoice].includes(newChannel.type)) {
                if (oldChannel.bitrate !== newChannel.bitrate) {
                    updateEmbed.addFields([
                        { name: `Old Bitrate:`, value: `${(oldChannel.bitrate / 1000)}kbps`, inline: true },
                        { name: `New Bitrate:`, value: `${(newChannel.bitrate / 1000)}kbps`, inline: true }
                    ]);
                } else if (oldChannel.userLimit !== newChannel.userLimit) {
                    updateEmbed.addFields([
                        { name: `Old User Limit:`, value: oldChannel.userLimit.toString() || 'None', inline: true },
                        { name: `New User Limit:`, value: newChannel.userLimit.toString() || 'None', inline: true }
                    ]);
                } else if (oldChannel.rtcRegion !== newChannel.rtcRegion) {
                    updateEmbed.addFields([
                        { name: `Old Region:`, value: oldChannel.rtcRegion || 'Automatic', inline: true },
                        { name: `New Region:`, value: newChannel.rtcRegion || 'Automatic', inline: true }
                    ]);
                } else {
                    return;
                };
            };
            if (!updateEmbed.data.fields.some(field => field.name.startsWith('New'))) {
                // if a property on the channel changed, but there wont be anything new shown, dont sent the embed at all
                // sometimes, moving a channel between categories creates 2 channelUpdate events, one of which has no difference that is displayed
                return;
            };

            return log.send({ embeds: [updateEmbed] });
        } else if (log.permissionsFor(botMember).has(Discord.PermissionFlagsBits.SendMessages) && !log.permissionsFor(botMember).has(Discord.PermissionFlagsBits.EmbedLinks)) {
            try {
                return log.send({ content: `I lack permissions to send embeds in ${log}.` });
            } catch (e) {
                // console.log(e);
                return;
            };
        } else {
            return;
        };

    } catch (e) {
        // Log error
        logger(e, client);
    };
};
