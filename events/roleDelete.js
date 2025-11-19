import {
    EmbedBuilder,
    PermissionFlagsBits,
    AuditLogEvent
} from "discord.js";
import logger from "../util/logger.js";
import isRoleDefaultColors from "../util/discord/roles/isRoleDefaultColors.js";
import isRoleHolographic from "../util/discord/roles/isRoleHolographic.js";
import numberToHex from "../util/math/numberToHex.js";
import checkPermissions from "../util/discord/perms/checkPermissions.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };

export default async (client, role) => {
    try {
        let serverApi = await import("../database/dbServices/server.api.js");
        serverApi = await serverApi.default();
        let logChannel = await serverApi.LogChannels.findOne({ where: { server_id: role.guild.id } });
        if (!logChannel) return;
        let log = role.guild.channels.cache.get(logChannel.channel_id);
        if (!log) return;

        let botMember = role.guild.members.me;
        if (checkPermissions({ member: botMember, channel: log, permissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks] })) {
            const fetchedLogs = await role.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.RoleDelete
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
            let embedColor = role.colors.primaryColor;
            let roleColorText = "";
            if (isRoleDefaultColors(role.colors)) {
                embedColor = globalVars.embedColor;
            } else {
                roleColorText = `#${numberToHex(role.colors.primaryColor)}`;
                if (role.colors.secondaryColor) roleColorText += ` & #${numberToHex(role.colors.secondaryColor)}`;
                if (isRoleHolographic(role.colors)) roleColorText = "Holographic";
            };
            const deleteEmbed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle(`Role Deleted ❌`)
                .setDescription(role.name)
                .setFooter({ text: `ID: ${role.id}` })
                .setTimestamp();
            if (roleColorText.length > 0) deleteEmbed.addFields([{ name: 'Color:', value: roleColorText, inline: true }]);
            if (executor) deleteEmbed.addFields([{ name: 'Deleted By:', value: `${executor} (${executor.id})`, inline: true }])
            return log.send({ embeds: [deleteEmbed] });
        } else if (checkPermissions({ member: botMember, channel: log, permissions: [PermissionFlagsBits.SendMessages] }) && !checkPermissions({ member: botMember, channel: log, permissions: [PermissionFlagsBits.EmbedLinks] })) {
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