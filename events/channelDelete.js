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

        if (log.permissionsFor(botMember).has(Discord.PermissionFlagsBits.SendMessages) && log.permissionsFor(botMember).has(Discord.PermissionFlagsBits.EmbedLinks)) {
            const fetchedLogs = await channel.guild.fetchAuditLogs({
                limit: 1,
                type: Discord.AuditLogEvent.ChannelDelete
            });
            let deleteLog = fetchedLogs.entries.first();
            if (deleteLog && deleteLog.createdTimestamp < (Date.now() - 5000)) deleteLog = null;
            let executor;
            if (deleteLog) {
                const { executor: createExecutor, target } = deleteLog;
                if (target.id === channel.id) {
                    executor = createExecutor;
                };
            };
            const channelType = channel.constructor.name;
            let footer = channel.id;
            if (executor) footer = executor.username;
            let icon = channel.guild.iconURL(globalVars.displayAvatarSettings);
            const deleteEmbed = new Discord.EmbedBuilder()
                .setColor(globalVars.embedColor)
                .setAuthor({ name: `${channelType} Channel Deleted ❌`, iconURL: icon })
                .addFields([{ name: `Channel:`, value: `${channel.name} (${channel.id})`, inline: true }])
                .setTimestamp();
            if (executor) deleteEmbed.addFields([{ name: 'Deleted By:', value: `${executor} (${executor.id})`, inline: true }]);
            return log.send({ embeds: [deleteEmbed] });
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