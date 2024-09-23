import {
    EmbedBuilder
} from "discord.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };

export default async ({ messageReaction, targetMessage, boardEmote }) => {
    // Check for atached files
    let attachmentsTitle = "Attachments:";
    let attachmentsString = "";
    let messageImage = null;
    let starboardEmbeds = [];
    // let seperateFiles = null;
    if (targetMessage.attachments.size > 0) {
        attachmentsTitle += ` (${targetMessage.attachments.size})`;
        messageImage = targetMessage.attachments.first().proxyURL;
        // Videos can't be embedded unless you're X (formerly Twitter) or YouTube, so they are sent as seperate mesages
        // if (messageImage.endsWith(".mp4")) seperateFiles = messageImage;
        targetMessage.attachments.forEach(attachment => {
            if (attachment.proxyURL !== messageImage) {
                let imageEmbed = new EmbedBuilder()
                    .setImage(attachment.proxyURL)
                    .setURL(targetMessage.url);
                starboardEmbeds.push(imageEmbed);
            };
            if ((attachmentsString.length + attachment.proxyURL.length) < 1024) attachmentsString += `${attachment.proxyURL}\n`;
        });
    };
    // Get user's avatar, try to use server avatar, otherwise default to global avatar
    let avatar = targetMessage.author.displayAvatarURL(globalVars.displayAvatarSettings);
    if (targetMessage.member) avatar = targetMessage.member.displayAvatarURL(globalVars.displayAvatarSettings);
    // Check if the starred message is replying to another message
    let isReply = false;
    let replyMessage = null;
    let replyString = "";
    if (targetMessage.reference) isReply = true;
    if (isReply) {
        try {
            // Format message the starred message is replying to
            replyMessage = await targetMessage.channel.messages.fetch(targetMessage.reference.messageId);
            if (replyMessage.content.length > 0) replyString += `"${replyMessage.content.slice(0, 950)}"`;
            if (replyMessage.author) replyString += `\n-${replyMessage.author}`;
        } catch (e) {
            isReply = false;
        };
    };
    // Format the starboard embed message
    const starEmbed = new EmbedBuilder()
        .setColor(globalVars.embedColor)
        .setTitle(`${boardEmote}${messageReaction.count}`)
        .setURL(targetMessage.url)
        .setThumbnail(avatar)
        .setImage(messageImage)
        .setFooter({ text: targetMessage.author.username })
        .setTimestamp(targetMessage.createdTimestamp);
    if (targetMessage.content) starEmbed.setDescription(targetMessage.content);
    starEmbed.addFields([{ name: `Context:`, value: targetMessage.url, inline: false }]);
    if (targetMessage.attachments.size > 0) starEmbed.addFields([{ name: attachmentsTitle, value: attachmentsString, inline: false }])
    if (isReply && replyString.length > 0) starEmbed.addFields([{ name: `Replying to:`, value: replyString, inline: false }]);
    starboardEmbeds.unshift(starEmbed);
    return { embeds: starboardEmbeds };
};