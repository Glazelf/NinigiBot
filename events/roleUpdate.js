module.exports = async (client, oldRole, newRole) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");
        const { LogChannels } = require('../database/dbObjects');

        let logChannel = await LogChannels.findOne({ where: { server_id: newRole.guild.id } });
        if (!logChannel) return;
        let log = newRole.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        let botMember = await newRole.guild.members.fetch(client.user.id);

        if (log.permissionsFor(botMember).has("SEND_MESSAGES") && log.permissionsFor(botMember).has("EMBED_LINKS")) {
            const fetchedLogs = await newRole.guild.fetchAuditLogs({
                limit: 1,
                type: 'ROLE_UPDATE',
            });
            const updateLog = fetchedLogs.entries.first();
            let executor;
            if (updateLog) {
                const { executor: updateExecutor, target } = updateLog;
                if (target.id !== newRole.id) return;
                executor = updateExecutor;
            }

            const updateEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor(`Role Updated`)
                .addField('Updated by: ', `${executor} (${executor.id})`)
                .setTimestamp();

            if (oldRole.name !== newRole.name) {
                updateEmbed
                    .addField(`Old name: `, oldRole.name)
                    .addField(`New name: `, newRole.name);
            } else {
                updateEmbed.addField('Role name: ', newRole.name)
            }
            
            if (oldRole.color !== newRole.color) {
                updateEmbed
                    .addField(`Old color: `, oldRole.hexColor)
                    .addField(`New color: `, newRole.hexColor);
            }

            if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
                const permissionSerializer = require('../util/permissionBitfieldSerializer');
                const oldPermissions = permissionSerializer(oldRole.permissions);
                const newPermissions = permissionSerializer(newRole.permissions);
                updateEmbed
                    .addField(`Old permissions: `, oldPermissions.join(', '))
                    .addField(`New permissions: `, newPermissions.join(', '));
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
