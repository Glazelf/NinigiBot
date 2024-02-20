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

        let botMember = newRole.guild.members.me;

        if (log.permissionsFor(botMember).has(Discord.PermissionFlagsBits.SendMessages) && log.permissionsFor(botMember).has(Discord.PermissionFlagsBits.EmbedLinks)) {
            const fetchedLogs = await newRole.guild.fetchAuditLogs({
                limit: 1,
                type: Discord.AuditLogEvent.RoleUpdate
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
                .addFields([{ name: `Role:`, value: `${newRole} (${newRole.id})`, inline: true }])
                .setTimestamp();
            if (executor) {
                updateEmbed
                    .addFields([{ name: 'Updated By:', value: `${executor} (${executor.id})`, inline: true }])
                    .setFooter({ text: executor.username });
            };
            if (oldRole.name !== newRole.name) {
                updateEmbed.addFields([
                    { name: `Old Name:`, value: oldRole.name, inline: true },
                    { name: `New Name:`, value: newRole.name, inline: true }
                ]);
            } else if (oldRole.color !== newRole.color) {
                updateEmbed.addFields([
                    { name: `Old Color:`, value: oldRole.hexColor, inline: true },
                    { name: `New Color:`, value: newRole.hexColor, inline: true }
                ]);
            } else if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
                if (oldPermissions.length > 0 && newPermissions.length > 0) {
                    updateEmbed.addFields([
                        { name: `Old Permissions:`, value: oldRole.permissions.toArray().join(', '), inline: false },
                        { name: `New Permissions:`, value: newRole.permissions.toArray().join(', '), inline: false }
                    ]);
                };
            } else {
                return;
            };
            if (oldRole.icon !== newRole.icon) {
                let oldIcon = oldRole.iconURL(globalVars.displayAvatarSettings);
                let newIcon = newRole.iconURL(globalVars.displayAvatarSettings);
                updateEmbed
                    .setDescription(`Icon Updated.`)
                    .setThumbnail(oldIcon)
                    .setImage(newIcon);
            };
            return log.send({ embeds: [updateEmbed] });
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