module.exports = async (client, channel) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");
        const { LogChannels } = require('../database/dbServices/server.api');

        let logChannel = await LogChannels.findOne({ where: { server_id: channel.guild.id } });
        if (!logChannel) return;
        let log = channel.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        let botMember = channel.guild.members.me;

        if (log.permissionsFor(botMember).has("SEND_MESSAGES") && log.permissionsFor(botMember).has("EMBED_LINKS")) {
            const getChannelTypeName = require('../util/getChannelType');
            const fetchedLogs = await channel.guild.fetchAuditLogs({
                limit: 1,
                type: 'CHANNEL_CREATE',
            });
            let createLog = fetchedLogs.entries.first();
            if (createLog && createLog.createdTimestamp < (Date.now() - 5000)) createLog = null;
            let executor;
            if (createLog) {
                const { executor: createExecutor, target } = createLog;
                if (target.id === channel.id) {
                    executor = createExecutor;
                };
            };
            const channelType = getChannelTypeName(channel);
            let footer = channel.id;
            if (executor) footer = executor.tag;
            let icon = channel.guild.iconURL(globalVars.displayAvatarSettings);
            const createEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor({ name: `${channelType} Channel Created ⭐`, iconURL: icon })
                .addField(`Channel:`, `${channel} (${channel.id})`)
                .setFooter({ text: footer })
                .setTimestamp();
            if (channel.parent) createEmbed.addField('Parent category:', channel.parent.name);
            if (executor) createEmbed.addField('Created by:', `${executor} (${executor.id})`);

            return log.send({ embeds: [createEmbed] });
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