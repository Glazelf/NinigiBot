module.exports = async (client, channel) => {
    const logger = require('../util/logger');
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
            let icon = channel.guild.iconURL(client.globalVars.displayAvatarSettings);
            const deleteEmbed = new Discord.EmbedBuilder()
                .setColor(client.globalVars.embedColor)
                .setTitle(`${channelType} Deleted ❌`)
                .setDescription(`${channel.name} (${channel.id})`)
                .setFooter({ text: channel.id })
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