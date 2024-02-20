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
                type: 'ROLE_CREATE',
            });
            let createLog = fetchedLogs.entries.first();
            if (createLog && createLog.createdTimestamp < (Date.now() - 5000)) createLog = null;
            let executor;
            if (createLog) {
                const { executor: createExecutor, target } = createLog;
                if (target.id !== role.id) return;
                executor = createExecutor;
            };

            const permissionSerializer = require('../util/permissionBitfieldSerializer');
            const permissions = permissionSerializer(role.permissions);

            let icon = role.guild.iconURL(globalVars.displayAvatarSettings);
            // The roleCreated event fires immediately upon clicking the add role button,
            // so the role name will always be the discord default "new role" and the color/permissions will always be the default
            const createEmbed = new Discord.EmbedBuilder()
                .setColor(globalVars.embedColor)
                .setAuthor({ name: `Role Created ⭐`, iconURL: icon })
                .addFields([
                    { name: `Role:`, value: `${role} (${role.id})` },
                    { name: `Role name:`, value: role.name }
                ])
                .setTimestamp();
            if (executor) {
                createEmbed
                    .addFields([{ name: 'Created By:', value: `${executor} (${executor.id})`, inline: true }])
                    .setFooter({ text: executor.username });
            };
            if (permissions.length > 0) createEmbed.addFields([{ name: `Permissions:`, value: permissions.join(', '), inline: false }]);

            return log.send({ embeds: [createEmbed] });
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