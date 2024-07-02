import {
    EmbedBuilder,
    PermissionFlagsBits,
    AuditLogEvent
} from "discord.js";
import logger from "../util/logger.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };

export default async (client, channel) => {
    try {
        let serverApi = await import("../database/dbServices/server.api.js");
        serverApi = await serverApi.default();
        let logChannel = await serverApi.LogChannels.findOne({ where: { server_id: channel.guild.id } });
        if (!logChannel) return;
        let log = channel.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        let botMember = channel.guild.members.me;

        if (log.permissionsFor(botMember).has(PermissionFlagsBits.SendMessages) && log.permissionsFor(botMember).has(PermissionFlagsBits.EmbedLinks)) {
            const fetchedLogs = await channel.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.ChannelCreate
            });
            let createLog = fetchedLogs.entries.first();
            if (createLog && createLog.createdTimestamp < (Date.now() - 5000)) createLog = null;
            let executor;
            if (createLog) {
                const { executor: createExecutor, target } = createLog;
                if (target.id === channel.id) {
                    executor = createExecutor;
                };
            };
            const channelType = channel.constructor.name;
            let footer = channel.id;
            if (executor) footer = executor.username;
            const createEmbed = new EmbedBuilder()
                .setColor(globalVars.embedColor)
                .setTitle(`${channelType} Created ⭐`)
                .setDescription(`${channel} (${channel.id})`)
                .setFooter({ text: footer })
                .setTimestamp();
            if (channel.parent) createEmbed.addFields([{ name: 'Parent category:', value: channel.parent.name, inline: true }]);
            if (executor) createEmbed.addFields([{ name: 'Created By:', value: `${executor} (${executor.id})`, inline: true }]);
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