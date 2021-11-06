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
            const getChannelTypeName = require('../util/getChannelType');
            const fetchedLogs = await newChannel.guild.fetchAuditLogs({
                limit: 1,
                type: 'CHANNEL_UPDATE',
            });
            const updateLog = fetchedLogs.entries.first();
            let executor;
            if (updateLog) {
                const { executor: createExecutor, target } = updateLog;
                if (target.id === newChannel.id) {
                    executor = createExecutor;
                };
            };

            const oldChannelType = getChannelTypeName(oldChannel);
            const newChannelType = getChannelTypeName(newChannel);

            let footer = newChannel.id;
            if (executor) footer = executor.tag;

            let icon = newChannel.guild.iconURL(globalVars.displayAvatarSettings);

            const updateEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor(`${newChannelType} Channel Updated ⚒️`, icon)
                .addField(`Channel:`, `${newChannel} (${newChannel.id})`)
                .setFooter(footer)
                .setTimestamp();

            if (executor) updateEmbed.addField('Updated by:', `${executor} (${executor.id})`);

            if (oldChannel.name !== newChannel.name) {
                updateEmbed
                    .addField(`Old name:`, oldChannel.name)
                    .addField(`New name:`, newChannel.name);
            } else {
                updateEmbed.addField('Channel name: ', newChannel.name);
            };

            if (oldChannel.type !== newChannel.type) {
                updateEmbed
                    .addField(`Old type:`, oldChannelType)
                    .addField(`New type:`, newChannelType);
            };

            if (oldChannel.parentId !== newChannel.parentId) {
                updateEmbed
                    .addField(`Old category:`, oldChannel.parent?.name ?? '(None)')
                    .addField(`New category:`, newChannel.parent?.name ?? '(None)');
            };

            if (['GUILD_TEXT', 'GUILD_NEWS', 'GUILD_STORE'].includes(newChannel.type)) {
                if (oldChannel.topic !== newChannel.topic) {
                    updateEmbed
                        .addField(`Old topic:`, oldChannel.topic || '(None)')
                        .addField(`New topic:`, newChannel.topic || '(None)');
                };
                if (oldChannel.nsfw !== newChannel.nsfw) {
                    updateEmbed
                        .addField(`Old Is NSFW:`, `${oldChannel.nsfw}`)
                        .addField(`New Is NSFW:`, `${newChannel.nsfw}`);
                };

                // these will both be undefined on a GUILD_NEWS channel, since there is no rate limit there, possibly also for GUILD_STORE channels
                let oldSlowmode = 0;
                let newSlowmode = 0;
                if (oldChannel.rateLimitPerUser) oldSlowmode = oldChannel.rateLimitPerUser;
                if (newChannel.rateLimitPerUser) newSlowmode = newChannel.rateLimitPerUser;
                if (oldSlowmode !== newSlowmode) {
                    updateEmbed
                        .addField(`Old slowmode timer:`, `${oldSlowmode} seconds`)
                        .addField(`New slowmode timer:`, `${newSlowmode} seconds`);
                };
            } else if (['GUILD_VOICE', 'GUILD_STAGE_VOICE'].includes(newChannel.type)) {
                if (oldChannel.bitrate !== newChannel.bitrate) {
                    updateEmbed
                        .addField(`Old bitrate:`, `${(oldChannel.bitrate / 1000)}kbps`)
                        .addField(`New bitrate:`, `${(newChannel.bitrate / 1000)}kbps`);
                };
                if (oldChannel.userLimit !== newChannel.userLimit) {
                    updateEmbed
                        .addField(`Old user limit:`, `${oldChannel.userLimit || 'No limit'}`)
                        .addField(`New user limit:`, `${newChannel.userLimit || 'No limit'}`);
                };
                if (oldChannel.rtcRegion !== newChannel.rtcRegion) {
                    updateEmbed
                        .addField(`Old region:`, oldChannel.rtcRegion || 'automatic')
                        .addField(`New region:`, newChannel.rtcRegion || 'automatic');
                };
            };

            if (!updateEmbed.fields.some(field => field.name.startsWith('New'))) {
                // if a property on the channel changed, but there wont be anything new shown, dont sent the embed at all
                // sometimes, moving a channel between categories creates 2 channelUpdate events, one of which has no difference that is displayed
                return;
            };

            return log.send({ embeds: [updateEmbed] });
        } else if (log.permissionsFor(botMember).has("SEND_MESSAGES") && !log.permissionsFor(botMember).has("EMBED_LINKS")) {
            try {
                return log.send({ content: `I lack permissions to send embeds in your log channel.` });
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
