import {
    EmbedBuilder,
    PermissionFlagsBits,
    AuditLogEvent
} from "discord.js";
import logger from "../util/logger.js";
import isRoleDefaultColors from "../util/discord/roles/isRoleDefaultColors.js";
import isRoleHolographic from "../util/discord/roles/isRoleHolographic.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };

export default async (client, oldRole, newRole) => {
    try {
        let serverApi = await import("../database/dbServices/server.api.js");
        serverApi = await serverApi.default();
        let logChannel = await serverApi.LogChannels.findOne({ where: { server_id: newRole.guild.id } });
        if (!logChannel) return;
        let log = newRole.guild.channels.cache.get(logChannel.channel_id);
        if (!log) return;

        let botMember = newRole.guild.members.me;
        if (log.permissionsFor(botMember).has(PermissionFlagsBits.SendMessages) && log.permissionsFor(botMember).has(PermissionFlagsBits.EmbedLinks)) {
            const fetchedLogs = await newRole.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.RoleUpdate
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
            let embedColor = newRole.colors.primaryColor;
            if (isRoleDefaultColors(newRole.colors)) embedColor = globalVars.embedColor;
            let updateDescription = `${newRole} (${newRole.id})`;

            const updateEmbed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle(`Role Updated ⚒️`)
                .setFooter({ text: `ID: ${newRole.id}` })
                .setTimestamp();
            if (oldRole.name !== newRole.name) {
                updateEmbed.addFields([
                    { name: `Name:`, value: `Old: ${oldRole.name}\nNew: ${newRole.name}`, inline: true }
                ]);
            };
            if (oldRole.rawPosition !== newRole.rawPosition) {
                updateEmbed.addFields([{ name: `Position:`, value: `Old: ${oldRole.rawPosition}\nNew: ${newRole.rawPosition}`, inline: true }]);
            };
            if (JSON.stringify(oldRole.colors) !== JSON.stringify(newRole.colors)) {
                let roleOldColorsChangesString = `Old: ${oldRole.colors.primaryColor.toString(16)}`;
                let roleNewColorsChangesString = `New: ${newRole.colors.primaryColor.toString(16)}`;
                if (oldRole.colors.secondaryColor) roleOldColorsChangesString += `& #${oldRole.colors.secondaryColor.toString(16)}`;
                if (newRole.colors.secondaryColor) roleNewColorsChangesString += `& #${newRole.colors.secondaryColor.toString(16)}`;
                if (isRoleDefaultColors(oldRole.colors)) {
                    roleOldColorsChangesString = "Old: Default";
                } else if (isRoleHolographic(oldRole.colors)) {
                    roleOldColorsChangesString = "Old: Holographic";
                };
                if (isRoleDefaultColors(newRole.colors)) {
                    roleOldColorsChangesString = "New: Default";
                } else if (isRoleHolographic(newRole.colors)) {
                    roleNewColorsChangesString = "New: Holographic";
                };
                roleOldColorsChangesString += "\n";
                updateEmbed.addFields([{ name: "Colors", value: `${roleOldColorsChangesString}${roleNewColorsChangesString}`, inline: true }]);
            };
            if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
                // Only change that's seperated into two fields for better readability and to avoid hitting character limit on a field
                if (oldRole.permissions.toArray().length > 0 && newRole.permissions.toArray().length > 0) {
                    updateEmbed.addFields([
                        { name: `Old Permissions:`, value: oldRole.permissions.toArray().join(', '), inline: false },
                        { name: `New Permissions:`, value: newRole.permissions.toArray().join(', '), inline: false }
                    ]);
                };
            };
            if (oldRole.icon !== newRole.icon) {
                let oldIcon = oldRole.iconURL(globalVars.displayAvatarSettings);
                let newIcon = newRole.iconURL(globalVars.displayAvatarSettings);
                updateDescription += "\nIcon updated.";
                updateEmbed
                    .setThumbnail(oldIcon)
                    .setImage(newIcon);
            };
            updateEmbed.setDescription(updateDescription);
            if (executor) updateEmbed.addFields([{ name: 'Updated By:', value: `${executor} (${executor.id})`, inline: false }]);
            return log.send({ embeds: [updateEmbed] });
        } else if (log.permissionsFor(botMember).has(PermissionFlagsBits.SendMessages) && !log.permissionsFor(botMember).has(PermissionFlagsBits.EmbedLinks)) {
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
        logger({ exception: e, client: client });
    };
};