module.exports = async (client, role) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");
        const { LogChannels } = require('../database/dbObjects');

        let logChannel = await LogChannels.findOne({ where: { server_id: role.guild.id } });
        if (!logChannel) return;
        let log = role.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        let botMember = await role.guild.members.fetch(client.user.id);

        if (log.permissionsFor(botMember).has("SEND_MESSAGES") && log.permissionsFor(botMember).has("EMBED_LINKS")) {
            const fetchedLogs = await role.guild.fetchAuditLogs({
                limit: 1,
                type: 'ROLE_DELETE',
            });
            const deleteLog = fetchedLogs.entries.first();
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

            const deleteEmbed = new Discord.MessageEmbed()
                .setColor(embedColor)
                .setAuthor({ name: `Role Deleted ❌`, iconURL: icon })
                .addField(`Role:`, `${role.name} (${role.id})`)
                .setTimestamp();

            if (executor) {
                deleteEmbed
                    .addField('Deleted by:', `${executor} (${executor.id})`)
                    .setFooter({ text: executor.tag });
            };

            return log.send({ embeds: [deleteEmbed] });
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