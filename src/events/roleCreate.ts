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
                type: AuditLogEvent.RoleCreate
            });
            let createLog = fetchedLogs.entries.first();
            if (createLog && createLog.createdTimestamp < (Date.now() - 5000)) createLog = null;
            let executor;
            if (createLog) {
                const { executor: createExecutor, target } = createLog;
                if (target.id !== role.id) return;
                executor = createExecutor;
            };
            // The roleCreated event fires immediately upon clicking the add role button,
            // so the role name will always be the discord default "new role" and the color/permissions will always be the default
            const createEmbed = new EmbedBuilder()
                .setColor(globalVars.embedColor as ColorResolvable)
                .setTitle(`Role Created ⭐`)
                .setDescription(role.toString())
                .setFooter({ text: role.id })
                .setTimestamp();
            if (role.permissions.toArray().length > 0) createEmbed.addFields([{ name: `Permissions:`, value: role.permissions.toArray().join(', '), inline: false }]);
            if (executor) createEmbed.addFields([{ name: 'Created By:', value: `${executor} (${executor.id})`, inline: true }])
            return log.send({ embeds: [createEmbed] });
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