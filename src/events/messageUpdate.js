import {
    EmbedBuilder,
    PermissionFlagsBits
} from "discord.js";
import logger from "../util/logger.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };
import isAdmin from "../util/discord/perms/isAdmin.js";

export default async (client, oldMessage, newMessage) => {
    try {
        if (!oldMessage || !oldMessage.guild || !oldMessage.author || oldMessage.author.bot || oldMessage.author.system) return;
        if (oldMessage.content === newMessage.content) return;

        await oldMessage.guild.fetch();
        let serverApi = await import("../database/dbServices/server.api.js");
        serverApi = await serverApi.default();
        let logChannel = await serverApi.LogChannels.findOne({ where: { server_id: oldMessage.guild.id } });
        if (!logChannel) return;
        let log = oldMessage.guild.channels.cache.get(logChannel.channel_id);
        // Log sysbot channel events in a seperate channel
        if (globalVars.sysbotLogChannelID && globalVars.sysbotChannelIDs.includes(oldMessage.channel.id)) log = oldMessage.guild.channels.cache.get(globalVars.sysbotLogChannelID);
        if (!log) return;

        let botMember = oldMessage.guild.members.me;
        let updateEmbeds = []; // Max embeds is 10, max images is also 10, so this doesn't need to be size limited
        let adminBool = isAdmin(botMember);

        if ((log.permissionsFor(botMember).has(PermissionFlagsBits.SendMessages) && log.permissionsFor(botMember).has(PermissionFlagsBits.EmbedLinks)) || adminBool) {
            // Attachments
            let messageAttachmentsTitle = "Attachments:";
            let messageAttachmentsString = "";
            let messageImage = null;
            if (oldMessage.attachments.size > 0) {
                messageImage = oldMessage.attachments.first().proxyURL;
                messageAttachmentsTitle += ` (${oldMessage.attachments.size})`;
                oldMessage.attachments.forEach(attachment => {
                    // Image tiling
                    if (attachment.proxyURL !== oldMessage.attachments.first().proxyURL) {
                        let imageEmbed = new EmbedBuilder()
                            .setImage(attachment.proxyURL)
                            .setURL(oldMessage.url);
                        updateEmbeds.push(imageEmbed);
                    };
                    // Image links
                    if ((messageAttachmentsString.length + attachment.proxyURL.length) < 1024) messageAttachmentsString += `${attachment.proxyURL}\n`;
                });
            };
            // Content checks
            let messageContent = oldMessage.content;
            let newMessageContent = newMessage.content
            if (messageContent.length > 1024) messageContent = `${messageContent.substring(0, 1021)}...`;
            if (newMessageContent.length > 1024) newMessageContent = `${newMessageContent.substring(0, 1021)}...`;
            // Reply info
            let isReply = false;
            let replyMessage;
            if (oldMessage.reference) isReply = true;
            if (isReply) {
                try {
                    replyMessage = await oldMessage.channel.messages.fetch(oldMessage.reference.messageId);
                } catch (e) {
                    isReply = false;
                };
            };
            let avatar = newMessage.author.displayAvatarURL(globalVars.displayAvatarSettings);
            if (newMessage.member) avatar = newMessage.member.displayAvatarURL(globalVars.displayAvatarSettings);

            const updateEmbed = new EmbedBuilder()
                .setColor(globalVars.embedColor)
                .setTitle(`Message Edited ⚒️`)
                .setImage(messageImage)
                .setURL(oldMessage.url)
                .setDescription(`Author: ${oldMessage.author} (${oldMessage.author.id})\nChannel: ${oldMessage.channel} (${oldMessage.channel.id})\nContext: ${oldMessage.url}`)
                .setFooter({ text: oldMessage.author.username, iconURL: avatar })
                .setTimestamp(oldMessage.createdTimestamp);
            if (messageContent.length > 0) updateEmbed.addFields([{ name: `Before:`, value: messageContent, inline: false }]);
            updateEmbed.addFields([{ name: `After:`, value: newMessageContent, inline: false }]);
            if (messageAttachmentsString.length > 0) updateEmbed.addFields([{ name: messageAttachmentsTitle, value: messageAttachmentsString }]);
            if (isReply && replyMessage && replyMessage.author && replyMessage.content.length > 0) updateEmbed.addFields([{ name: `Replying to:`, value: `"${replyMessage.content.slice(0, 950)}"\n-${replyMessage.author}`, inline: false }]);
            updateEmbeds.unshift(updateEmbed);
            return log.send({ embeds: updateEmbeds });
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
        logger({ exception: e, client: client, interaction: oldMessage });
    };
};
