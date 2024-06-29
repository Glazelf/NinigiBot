import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} from "discord.js";
import logger from "../util/logger.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };
import isAdmin from "../util/isAdmin.js";

export default async (client, message, newMessage) => {
    try {
        if (!message || !message.guild || !message.author || message.author.bot || message.author.system) return;
        if (message.content === newMessage.content) return;

        await message.guild.fetch();
        let serverApi = await import("../database/dbServices/server.api.js");
        serverApi = await serverApi.default();
        let logChannel = await serverApi.LogChannels.findOne({ where: { server_id: message.guild.id } });
        if (!logChannel) return;
        let log = message.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        // Log sysbot channel events in a seperate channel
        if (globalVars.sysbotLogChannelID && globalVars.sysbotChannelIDs.includes(message.channel.id)) log = message.guild.channels.cache.find(channel => channel.id == globalVars.sysbotLogChannelID);
        if (!log) return;

        let botMember = message.guild.members.me;
        // Check message content
        let adminBool = isAdmin(client, botMember);

        if ((log.permissionsFor(botMember).has(PermissionFlagsBits.SendMessages) && log.permissionsFor(botMember).has(PermissionFlagsBits.EmbedLinks)) || adminBool) {
            // Assets
            let messageImage = null; // Very inconsistent, almost never works
            let messageAttachmentsTitle = "Attachments:";
            let messageAttachmentsString = "";
            if (message.attachments.size > 0) {
                messageImage = message.attachments.first().proxyURL;
                messageAttachmentsTitle += ` (${Object.entries(message.attachments).length})`;
                message.attachments.forEach(attachment => {
                    if ((messageAttachmentsString.length + attachment.proxyURL.length) < 1024) messageAttachmentsString += `${attachment.proxyURL}\n`;
                });
            };
            // Content checks
            let messageContent = message.content;
            let newMessageContent = newMessage.content
            if (messageContent.length > 1024) messageContent = `${messageContent.substring(0, 1021)}...`;
            if (newMessageContent.length > 1024) newMessageContent = `${newMessageContent.substring(0, 1021)}...`;
            // Reply info
            let isReply = false;
            let replyMessage;
            if (message.reference) isReply = true;
            if (isReply) {
                try {
                    replyMessage = await message.channel.messages.fetch(message.reference.messageId);
                } catch (e) {
                    isReply = false;
                };
            };
            let avatar;
            if (newMessage.member) {
                avatar = newMessage.member.displayAvatarURL(globalVars.displayAvatarSettings);
            } else {
                avatar = newMessage.author.displayAvatarURL(globalVars.displayAvatarSettings);
            };
            const contextButton = new ButtonBuilder()
                .setLabel("Context")
                .setStyle(ButtonStyle.Link)
                .setURL(`discord://-/channels/${message.guild.id}/${message.channel.id}/${message.id}`);
            let updateButtons = new ActionRowBuilder()
                .addComponents(contextButton);

            const updateEmbed = new EmbedBuilder()
                .setColor(globalVars.embedColor)
                .setTitle(`Message Edited ⚒️`)
                .setThumbnail(avatar)
                .setDescription(`Author:${message.author} (${message.author.id})\nChannel: ${message.channel} (${message.channel.id})`)
                .setImage(messageImage)
                .setFooter({ text: message.author.username })
                .setTimestamp(message.createdTimestamp);
            if (messageContent.length > 0) updateEmbed.addFields([{ name: `Before:`, value: messageContent, inline: false }]);
            updateEmbed.addFields([{ name: `After:`, value: newMessageContent, inline: false }]);
            if (messageAttachmentsString.length > 0) updateEmbed.addFields([{ name: messageAttachmentsTitle, value: messageAttachmentsString }]);
            if (isReply && replyMessage && replyMessage.author && replyMessage.content.length > 0) updateEmbed.addFields([{ name: `Replying to:`, value: `"${replyMessage.content.slice(0, 950)}"\n-${replyMessage.author}`, inline: false }]);
            return log.send({ embeds: [updateEmbed], components: [updateButtons] });
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
        logger(e, client, message);
    };
};
