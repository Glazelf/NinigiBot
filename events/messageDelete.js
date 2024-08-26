import {
    EmbedBuilder,
    PermissionFlagsBits,
    AuditLogEvent
} from "discord.js";
import logger from "../util/logger.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };

export default async (client, message) => {
    try {
        let serverApi = await import("../database/dbServices/server.api.js");
        serverApi = await serverApi.default();
        if (!message || !message.guild || !message.author || message.author.bot || message.author.system) return;
        console.log
        let messageDB = await serverApi.StarboardMessages.findOne({ where: { channel_id: message.channel.id, message_id: message.id } });
        if (messageDB) {
            let starboardChannel = await client.channels.fetch(messageDB.starboard_channel_id);
            if (starboardChannel) {
                let starboardMessage = await starboardChannel.messages.fetch(messageDB.starboard_message_id);
                if (starboardMessage) starboardMessage.delete();
            };
        };
        // Get log
        let logChannel = await serverApi.LogChannels.findOne({ where: { server_id: message.guild.id } });
        if (!logChannel) return;
        let log = message.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        // Log sysbot channel events in a seperate channel
        if (globalVars.sysbotLogChannelID && globalVars.sysbotChannelIDs.includes(message.channel.id)) log = message.guild.channels.cache.find(channel => channel.id == globalVars.sysbotLogChannelID);
        if (!log) return;
        let executor = null;
        try {
            const fetchedLogs = await message.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MessageDelete
            });
            let deleteLog = fetchedLogs.entries.first();
            if (deleteLog) {
                executor = deleteLog.executor;
                // Date.now() - 5000 is to make sure log is <5 seconds ago
                if (deleteLog.extra.channel != message.channel || deleteLog.target.id != message.member.id || deleteLog.createdTimestamp < (Date.now() - 5000)) executor = null;
            };
        } catch (e) {
            // console.log(e);
            executor = null;
        };
        // Check message content
        let botMember = message.guild.members.me;
        if (log.permissionsFor(botMember).has(PermissionFlagsBits.SendMessages) && log.permissionsFor(botMember).has(PermissionFlagsBits.EmbedLinks)) {
            if (!message || !message.author) return;
            if (message.channel == log && message.author == client.user) return;

            let messageContent = message.content;
            if (messageContent.length > 1024) messageContent = `${messageContent.substring(0, 1021)}...`;

            let isReply = false;
            let replyMessage
            if (message.reference) isReply = true;
            if (isReply) {
                try {
                    replyMessage = await message.channel.messages.fetch(message.reference.messageId);
                } catch (e) {
                    isReply = false;
                };
            };
            // Attachments
            let messageAttachmentsTitle = "Attachments:";
            let messageAttachmentsString = "";
            if (message.attachments.size > 0) {
                messageAttachmentsTitle += ` (${message.attachments.size})`;
                message.attachments.forEach(attachment => {
                    if ((messageAttachmentsString.length + attachment.proxyURL.length) < 1024) messageAttachmentsString += `${attachment.proxyURL}\n`;
                });
            };
            let avatar = message.author.displayAvatarURL(globalVars.displayAvatarSettings);
            if (message.member) avatar = message.member.displayAvatarURL(globalVars.displayAvatarSettings);

            const deleteEmbed = new EmbedBuilder()
                .setColor(globalVars.embedColor)
                .setTitle(`Message Deleted ❌`)
                .setThumbnail(avatar)
                .setDescription(`Author: ${message.author} (${message.author.id})\nChannel: ${message.channel} (${message.channel.id})`);
            if (messageContent.length > 0) deleteEmbed.addFields([{ name: `Content:`, value: messageContent, inline: false }]);
            if (messageAttachmentsString.length > 0) deleteEmbed.addFields([{ name: messageAttachmentsTitle, value: messageAttachmentsString }]);
            if (isReply && replyMessage && replyMessage.author && replyMessage.content.length > 0) deleteEmbed.addFields([{ name: `Replying to:`, value: `"${replyMessage.content.slice(0, 950)}"\n-${replyMessage.author} (${replyMessage.author.id})`, inline: true }]);
            if (executor) deleteEmbed.addFields([{ name: 'Executor:', value: `${executor} (${executor.id})`, inline: true }]);
            deleteEmbed
                .setFooter({ text: message.author.username })
                .setTimestamp(message.createdTimestamp);
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
        logger({ exception: e, client: client, interaction: message });
    };
};
