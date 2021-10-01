module.exports = async (client, oldChannel, newChannel) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");
        const { LogChannels } = require('../database/dbObjects');

        let logChannel = await LogChannels.findOne({ where: { server_id: newChannel.guild.id } });
        if (!logChannel) return;
        let log = newChannel.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        let botMember = await newChannel.guild.members.fetch(client.user.id);

        if (log.permissionsFor(botMember).has("SEND_MESSAGES") && log.permissionsFor(botMember).has("EMBED_LINKS")) {
            const getChannelType = require('../util/getChannelType');
            const fetchedLogs = await newChannel.guild.fetchAuditLogs({
                limit: 1,
                type: 'CHANNEL_UPDATE',
            });
            const updateLog = fetchedLogs.entries.first();
            let executor
            if (updateLog) {
                const { executor: createExecutor, target } = updateLog;
                if (target.id === newChannel.id) {
                    executor = createExecutor;
                }
            };

            const channelType = getChannelType(newChannel);

            const updateEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor(`${channelType} Channel Updated ⚒️`)
                .addField('Updated by: ', `${executor} (${executor.id})`)
                .setFooter(newChannel.id)
                .setTimestamp();

            if (oldChannel.name !== newChannel.name) {
                updateEmbed
                    .addField(`Old name: `, oldChannel.name)
                    .addField(`New name: `, newChannel.name);
            } else {
                updateEmbed.addField('Channel name: ', newChannel.name);
            };

            if (oldChannel.parentId !== newChannel.parentId) {
                updateEmbed
                    .addField(`Old category: `, oldChannel.parent?.name ?? 'None')
                    .addField(`New category: `, newChannel.parent?.name ?? 'None');
            };

            if (['GUILD_TEXT', 'GUILD_NEWS', 'GUILD_STORE'].includes(newChannel.type)) {
                if (oldChannel.topic !== newChannel.topic) {
                    updateEmbed
                        .addField(`Old topic: `, oldChannel.topic || 'Empty')
                        .addField(`New topic: `, newChannel.topic || 'Empty');
                }
                if (oldChannel.nsfw !== newChannel.nsfw) {
                    updateEmbed
                        .addField(`Old Is NSFW: `, `${oldChannel.nsfw}`)
                        .addField(`Old Is NSFW: `, `${newChannel.nsfw}`);
                }
                // these will both be undefined on a GUILD_NEWS channel, since there is no rate limit there
                if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
                    updateEmbed
                        .addField(`Old slowmode timer: `, `${oldChannel.rateLimitPerUser} seconds`)
                        .addField(`New slowmode timer: `, `${newChannel.rateLimitPerUser} seconds`);
                }
            } else if (['GUILD_VOICE', 'GUILD_STAGE_VOICE'].includes(newChannel.type)) {
                if (oldChannel.bitrate !== newChannel.bitrate) {
                    updateEmbed
                        .addField(`Old bitrate: `, `${oldChannel.bitrate}`)
                        .addField(`New bitrate: `, `${newChannel.bitrate}`);
                }
                if (oldChannel.userLimit !== newChannel.userLimit) {
                    updateEmbed
                        .addField(`Old user limit: `, `${oldChannel.userLimit}`)
                        .addField(`New user limit: `, `${newChannel.userLimit}`);
                }
                if (oldChannel.rtcRegion !== newChannel.rtcRegion) {
                    updateEmbed
                        .addField(`Old region: `, oldChannel.rtcRegion || 'Empty')
                        .addField(`New region: `, newChannel.rtcRegion || 'Empty');
                }
            }

            return log.send({ embeds: [updateEmbed] });
        } else if (log.permissionsFor(botMember).has("SEND_MESSAGES") && !log.permissionsFor(botMember).has("EMBED_LINKS")) {
            return log.send({ content: `I lack permissions to send embeds in your log channel.` });
        } else {
            return;
        };

    } catch (e) {
        // Log error
        logger(e, client);
    };
};
