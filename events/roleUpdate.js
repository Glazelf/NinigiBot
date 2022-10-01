module.exports = async (client, oldRole, newRole) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");
        const { LogChannels } = require('../database/dbServices/server.api');

        let logChannel = await LogChannels.findOne({ where: { server_id: newRole.guild.id } });
        if (!logChannel) return;
        let log = newRole.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        let botMember = newRole.guild.me;

        if (log.permissionsFor(botMember).has("SEND_MESSAGES") && log.permissionsFor(botMember).has("EMBED_LINKS")) {
            const fetchedLogs = await newRole.guild.fetchAuditLogs({
                limit: 1,
                type: 'ROLE_UPDATE',
            });
            let updateLog = fetchedLogs.entries.first();
            if (updateLog && updateLog.createdTimestamp < (Date.now() - 5000)) updateLog = null;
            let executor;
            if (updateLog) {
                const { executor: updateExecutor, target } = updateLog;
                if (target.id !== newRole.id) return;
                executor = updateExecutor;
            };

            // Role color
            let embedColor = newRole.hexColor;
            if (embedColor == "#000000") embedColor = globalVars.embedColor;

            let icon = newRole.guild.iconURL(globalVars.displayAvatarSettings);

            const updateEmbed = new Discord.EmbedBuilder()
                .setColor(embedColor)
                .setAuthor({ name: `Role Updated ⚒️`, iconURL: icon })
                .addField(`Role:`, `${newRole} (${newRole.id})`)
                .setTimestamp();
            console.log(oldRole.position)
            console.log(newRole.position)

            if (executor) {
                updateEmbed
                    .addField('Updated by:', `${executor} (${executor.id})`)
                    .setFooter({ text: executor.tag });
            };
            if (oldRole.name !== newRole.name) {
                updateEmbed
                    .addField(`Old name:`, oldRole.name)
                    .addField(`New name:`, newRole.name);
            } else if (oldRole.color !== newRole.color) {
                updateEmbed
                    .addField(`Old color:`, oldRole.hexColor)
                    .addField(`New color:`, newRole.hexColor);
            } else if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
                const permissionSerializer = require('../util/permissionBitfieldSerializer');
                const oldPermissions = permissionSerializer(oldRole.permissions);
                const newPermissions = permissionSerializer(newRole.permissions);
                if (oldPermissions.length > 0 && newPermissions.length > 0) {
                    updateEmbed
                        .addField(`Old permissions:`, oldPermissions.join(', '))
                        .addField(`New permissions:`, newPermissions.join(', '));
                };
            } else {
                return;
            };

            if (oldRole.icon !== newRole.icon) {
                let oldIcon = oldRole.iconURL(globalVars.displayAvatarSettings);
                let newIcon = newRole.iconURL(globalVars.displayAvatarSettings);
                updateEmbed
                    .setDescription(`Icon updated.`)
                    .setThumbnail(oldIcon)
                    .setImage(newIcon);
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