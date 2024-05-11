module.exports = async (client, oldChannel, newChannel) => {
    const logger = require('../util/logger');
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
            let icon = newChannel.guild.iconURL(client.globalVars.displayAvatarSettings);

            const updateEmbed = new Discord.EmbedBuilder()
                .setColor(client.globalVars.embedColor)
                .setTitle(`${newChannelType} Updated ⚒️`)
                .setDescription(`${newChannel} (${newChannel.id})`)
                .setFooter({ text: footer })
                .setTimestamp();
            if (oldChannel.name !== newChannel.name) {
                updateEmbed.addFields([
                    { name: `Name:`, value: `Old: ${oldChannel.name}\nNew: ${newChannel.name}`, inline: true }
                ]);
            };
            if (oldChannel.type !== newChannel.type) {
                updateEmbed.addFields([
                    { name: `Type:`, value: `Old: ${oldChannelType}\nNew: ${newChannelType}`, inline: true }
                ]);
            };
            if (oldChannel.parentId !== newChannel.parentId) { // Does not seem to fire correctly. Channel events are so buggy lol
                let categoryOld = oldChannel.parent?.name || "None";
                let categoryNew = newChannel.parent?.name || "None";
                updateEmbed.addFields([
                    { name: `Category:`, value: `Old: ${categoryOld}\nNew: ${categoryNew}`, inline: true }
                ]);
            };
            if ([Discord.ChannelType.GuildText, Discord.ChannelType.GuildNews, Discord.ChannelType.GuildStore].includes(newChannel.type)) {
                if (oldChannel.topic !== newChannel.topic) {
                    let topicOld = oldChannel.topic || 'None';
                    let topicNew = newChannel.topic || 'None';
                    updateEmbed.addFields([
                        { name: `Topic:`, value: `Old: ${topicOld}\nNew: ${topicNew}`, inline: true }
                    ]);
                };
                if (oldChannel.nsfw !== newChannel.nsfw) {
                    updateEmbed.addFields([
                        { name: `NSFW:`, value: `Old: ${oldChannel.nsfw}\nNew: ${newChannel.nsfw}`, inline: true }
                    ]);
                };
                // these will both be undefined on a GuildNews channel, since there is no rate limit there, possibly also for GuildStore channels
                let oldSlowmode = 0;
                let newSlowmode = 0;
                if (oldChannel.rateLimitPerUser) oldSlowmode = oldChannel.rateLimitPerUser;
                if (newChannel.rateLimitPerUser) newSlowmode = newChannel.rateLimitPerUser;
                if (oldSlowmode !== newSlowmode) {
                    updateEmbed.addFields([
                        { name: `Slowmode:`, value: `Old: ${oldSlowmode} seconds\nNew: ${newSlowmode} seconds`, inline: true }
                    ]);
                };
            };
            if ([Discord.ChannelType.GuildVoice, Discord.ChannelType.GuildStageVoice].includes(newChannel.type)) {
                if (oldChannel.bitrate !== newChannel.bitrate) {
                    updateEmbed.addFields([
                        { name: `Bitrate:`, value: `Old: ${(oldChannel.bitrate / 1000)}kbps\nNew: ${(newChannel.bitrate / 1000)}kbps`, inline: true }
                    ]);
                };
                if (oldChannel.userLimit !== newChannel.userLimit) {
                    let userLimitOld = "None";
                    let userLimitNew = userLimitOld;
                    if (oldChannel.userLimit) userLimitOld = oldChannel.userLimit;
                    if (newChannel.userLimit) userLimitNew = newChannel.userLimit;
                    updateEmbed.addFields([
                        { name: `User Limit:`, value: `Old: ${userLimitOld} users\nNew: ${userLimitNew} users`, inline: true }
                    ]);
                };
                if (oldChannel.rtcRegion !== newChannel.rtcRegion) {
                    let regionOld = oldChannel.rtcRegion || "Automatic";
                    let regionNew = newChannel.rtcRegion || "Automatic";
                    updateEmbed.addFields([
                        { name: `Region:`, value: `Old: ${regionOld}\nNew: ${regionNew}`, inline: true }
                    ]);
                };
            };
            // if a property on the channel changed, but there wont be anything new shown, dont sent the embed at all
            // sometimes, moving a channel between categories creates 2 channelUpdate events, one of which has no difference that is displayed
            if (!updateEmbed.data.fields) return;
            if (executor) updateEmbed.addFields([{ name: 'Updated By:', value: `${executor} (${executor.id})`, inline: false }]);
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