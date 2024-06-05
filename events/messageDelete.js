import Discord from "discord.js";
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
                type: Discord.AuditLogEvent.MessageDelete
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
        if (log.permissionsFor(botMember).has(Discord.PermissionFlagsBits.SendMessages) && log.permissionsFor(botMember).has(Discord.PermissionFlagsBits.EmbedLinks)) {
            if (!message || !message.author) return;
            if (message.channel == log && message.author == client.user) return;

            let messageContent = message.content;
            if (messageContent.length > 1024) messageContent = `${messageContent.substring(0, 1021)}...`;
            if (messageContent.length < 1) return;

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
            let avatar;
            if (message.member) {
                avatar = message.member.displayAvatarURL(globalVars.displayAvatarSettings);
            } else {
                avatar = message.author.displayAvatarURL(globalVars.displayAvatarSettings);
            };
            const deleteEmbed = new Discord.EmbedBuilder()
                .setColor(globalVars.embedColor)
                .setTitle(`Message Deleted ❌`)
                .setThumbnail(avatar)
                .setDescription(`Author: ${message.author} (${message.author.id})\nChannel: ${message.channel} (${message.channel.id})`)
                .addFields([{ name: `Content:`, value: messageContent, inline: false }]);
            if (isReply && replyMessage && replyMessage.author && replyMessage.content.length > 0) deleteEmbed.addFields([{ name: `Replying to:`, value: `"${replyMessage.content.slice(0, 950)}"\n-${replyMessage.author} (${replyMessage.author.id})`, inline: true }]);
            if (executor) deleteEmbed.addFields([{ name: 'Executor:', value: `${executor} (${executor.id})`, inline: true }]);
            deleteEmbed
                .setFooter({ text: message.author.username })
                .setTimestamp(message.createdTimestamp);
            return log.send({ embeds: [deleteEmbed] });
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
        logger(e, client, message);
    };
};