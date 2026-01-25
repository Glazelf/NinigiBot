import {
    EmbedBuilder,
    PermissionFlagsBits,
    AuditLogEvent
} from "discord.js";
import type { ExtendedClient } from '../types/global.js';
import logger from "../util/logger.js";
import checkPermissions from "../util/discord/perms/checkPermissions.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };

export default async (client: ExtendedClient, role) => {
    try {
        let serverApi: any = await import("../database/dbServices/server.api.js");
        serverApi = await serverApi.default() as any;
        let logChannel = await serverApi.LogChannels.findOne({ where: { server_id: role.guild.id } });
        if (!logChannel) return;
        let log = role.guild.channels.cache.get(logChannel.channel_id);
        if (!log) return;

        let botMember = role.guild.members.me;

        if (checkPermissions({ member: botMember, channel: log, permissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks] })) {
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
                .setColor(globalVars.embedColor as [number, number, number])
                .setTitle(`Role Created ⭐`)
                .setDescription(role.toString())
                .setFooter({ text: `ID: ${role.id}` })
                .setTimestamp();
            if (role.permissions.toArray().length > 0) createEmbed.addFields([{ name: `Permissions:`, value: role.permissions.toArray().join(', '), inline: false }]);
            if (executor) createEmbed.addFields([{ name: 'Created By:', value: `${executor} (${executor.id})`, inline: true }])
            return log.send({ embeds: [createEmbed.toJSON()] });
        } else if (checkPermissions({ member: botMember, channel: log, permissions: [PermissionFlagsBits.SendMessages] }) && !checkPermissions({ member: botMember, channel: log, permissions: [PermissionFlagsBits.EmbedLinks] })) {
            try {
                return log.send({ content: `I lack permissions to send embeds in ${log}.` });
            } catch (e: any) {
                // console.log(e);
                return;
            };
        } else {
            return;
        };

    } catch (e: any) {
        logger({ exception: e, client: client });
    };
};