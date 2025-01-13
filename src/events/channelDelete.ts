import {
    EmbedBuilder,
    PermissionFlagsBits,
    AuditLogEvent
} from "discord.js";
import logger from "../util/logger.js";

import globalVars from "../objects/globalVars.json";

export default async (client: any, channel: any) => {
    try {
        let serverApi = await import("../database/dbServices/server.api.js");
        // @ts-expect-error TS(2741): Property 'default' is missing in type '{ shinxQuot... Remove this comment to see the full error message
        serverApi = await serverApi.default();
        // @ts-expect-error TS(2339): Property 'LogChannels' does not exist on type 'typ... Remove this comment to see the full error message
        let logChannel = await serverApi.LogChannels.findOne({ where: { server_id: channel.guild.id } });
        if (!logChannel) return;
        let log = channel.guild.channels.cache.get(logChannel.channel_id);
        if (!log) return;

        let botMember = channel.guild.members.me;

        if (log.permissionsFor(botMember).has(PermissionFlagsBits.SendMessages) && log.permissionsFor(botMember).has(PermissionFlagsBits.EmbedLinks)) {
            const fetchedLogs = await channel.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.ChannelDelete
            });
            let deleteLog = fetchedLogs.entries.first();
            if (deleteLog && deleteLog.createdTimestamp < (Date.now() - 5000)) deleteLog = null;
            let executor;
            if (deleteLog) {
                const { executor: createExecutor, target } = deleteLog;
                if (target.id === channel.id) {
                    executor = createExecutor;
                };
            };
            const channelType = channel.constructor.name;
            let icon = channel.guild.iconURL(globalVars.displayAvatarSettings);
            const deleteEmbed = new EmbedBuilder()
                .setColor(globalVars.embedColor as ColorResolvable)
                .setTitle(`${channelType} Deleted ❌`)
                .setDescription(`${channel.name} (${channel.id})`)
                .setFooter({ text: channel.id })
                .setTimestamp();
            if (executor) deleteEmbed.addFields([{ name: 'Deleted By:', value: `${executor} (${executor.id})`, inline: true }]);
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