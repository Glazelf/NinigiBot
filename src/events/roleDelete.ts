import {
    EmbedBuilder,
    PermissionFlagsBits,
    AuditLogEvent
} from "discord.js";
import logger from "../util/logger.js";

import globalVars from "../objects/globalVars.json";

export default async (client: any, role: any) => {
    try {
        let serverApi = await import("../database/dbServices/server.api.js");
        // @ts-expect-error TS(2741): Property 'default' is missing in type '{ shinxQuot... Remove this comment to see the full error message
        serverApi = await serverApi.default();
        // @ts-expect-error TS(2339): Property 'LogChannels' does not exist on type 'typ... Remove this comment to see the full error message
        let logChannel = await serverApi.LogChannels.findOne({ where: { server_id: role.guild.id } });
        if (!logChannel) return;
        let log = role.guild.channels.cache.get(logChannel.channel_id);
        if (!log) return;

        let botMember = role.guild.members.me;
        if (log.permissionsFor(botMember).has(PermissionFlagsBits.SendMessages) && log.permissionsFor(botMember).has(PermissionFlagsBits.EmbedLinks)) {
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
            let embedColor = role.hexColor;
            let roleColorText = role.hexColor;
            if (!embedColor || embedColor == "#000000") {
                embedColor = globalVars.embedColor;
                roleColorText = null;
            };

            const deleteEmbed = new EmbedBuilder()
                .setColor(embedColor as ColorResolvable)
                .setTitle(`Role Deleted ❌`)
                .setDescription(role.name)
                .setFooter({ text: role.id })
                .setTimestamp();
            if (roleColorText) deleteEmbed.addFields([{ name: 'Color:', value: role.hexColor, inline: true }]);
            if (executor) deleteEmbed.addFields([{ name: 'Deleted By:', value: `${executor} (${executor.id})`, inline: true }])
            return log.send({ embeds: [deleteEmbed] });
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