module.exports = async (client, role) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");
        const { LogChannels } = require('../database/dbServices/server.api');

        let logChannel = await LogChannels.findOne({ where: { server_id: role.guild.id } });
        if (!logChannel) return;
        let log = role.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        let botMember = role.guild.members.me;

        if (log.permissionsFor(botMember).has("SEND_MESSAGES") && log.permissionsFor(botMember).has("EMBED_LINKS")) {
            const fetchedLogs = await role.guild.fetchAuditLogs({
                limit: 1,
                type: Discord.AuditLogEvent.RoleDelete
            });
            let deleteLog = fetchedLogs.entries.first();
            if (deleteLog && deleteLog.createdTimestamp < (Date.now() - 5000)) deleteLog = null;
            let executor;
            if (deleteLog) {
                const { executor: deleteExecutor, target } = deleteLog;
                if (target.id !== role.id) return;
                executor = deleteExecutor;
            };
            // Role color
            let embedColor = role.hexColor;
            if (!embedColor || embedColor == "#000000") embedColor = globalVars.embedColor;

            let icon = role.guild.iconURL(globalVars.displayAvatarSettings);

            const deleteEmbed = new Discord.EmbedBuilder()
                .setColor(embedColor)
                .setAuthor({ name: `Role Deleted ❌`, iconURL: icon })
                .addFields([{ name: `Role:`, value: `${role.name} (${role.id})`, inline: true }])
                .setTimestamp();
            if (executor) {
                deleteEmbed
                    .addFields([{ name: 'Deleted By:', value: `${executor} (${executor.id})`, inline: true }])
                    .setFooter({ text: executor.username });
            };
            return log.send({ embeds: [deleteEmbed] });
        } else if (log.permissionsFor(botMember).has("SEND_MESSAGES") && !log.permissionsFor(botMember).has("EMBED_LINKS")) {
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