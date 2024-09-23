import { EmbedBuilder } from "discord.js";
import logger from "../util/logger.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };

const starboardEmote = "⭐";
const altboardChannelID = "1234922298255872092"; // Evil starboard
const altboardEmote = "<:nostar:780198211913646130>";
const altboardEmoteID = altboardEmote.replace(/[^0-9]+/g, "");

export default async (client, messageReaction) => {
    try {
        const boardEmote = starboardEmote;
        // Check if message reaction counts are valid and that reaction is a star
        if (messageReaction.count == null || messageReaction.count == undefined) return;
        // Check if message is reacting to nostar in Shinx server
        const isNoStar = (messageReaction.emoji.id === altboardEmoteID && messageReaction.message.guildId == globalVars.ShinxServerID);
        if (messageReaction.emoji.name !== boardEmote && !isNoStar) return;
        let targetMessage = messageReaction.message;
        // Try to find the starboard channel, won't exist if server hasn't set one
        let starboardChannel, starboard;
        let serverApi = await import("../database/dbServices/server.api.js");
        serverApi = await serverApi.default();
        if (isNoStar == true) { // Find altboard channel
            boardEmote = altboardEmote;
            starboard = await targetMessage.guild.channels.fetch(altboardChannelID);
        } else { // Find starboard channel
            starboardChannel = await serverApi.StarboardChannels.findOne({ where: { server_id: targetMessage.guild.id } });
            if (!starboardChannel) return;
            starboard = await targetMessage.guild.channels.fetch(starboardChannel.channel_id);
        };
        if (!starboard) return;
        if (targetMessage.channel == starboard) return;
        // Try to find the starred message in database
        let messageDB = await serverApi.StarboardMessages.findOne({ where: { channel_id: targetMessage.channel.id, message_id: targetMessage.id } });
        // Get attachment, don't need to check videos since those are in seperate message anyways
        let messageImage = null;
        let starboardEmbeds = [];
        if (targetMessage.attachments.size > 0) {
            messageImage = targetMessage.attachments.first().proxyURL;
            targetMessage.attachments.forEach(attachment => {
                if (attachment.proxyURL !== messageImage) {
                    let imageEmbed = new EmbedBuilder()
                        .setImage(attachment.proxyURL)
                        .setURL(targetMessage.url);
                    starboardEmbeds.push(imageEmbed);
                };
            });
        };
        // Get user's avatar, try to use server avatar, otherwise default to global avatar
        let avatar = targetMessage.author.displayAvatarURL(globalVars.displayAvatarSettings);
        if (targetMessage.member) avatar = targetMessage.member.displayAvatarURL(globalVars.displayAvatarSettings);
        // Check if the starred message is replying to another message
        let isReply = false;
        let replyMessage;
        if (targetMessage.reference) isReply = true;
        if (isReply) {
            // Format message the starred message is replying to
            try {
                replyMessage = await targetMessage.channel.messages.fetch(targetMessage.reference.messageId);
            } catch (e) {
                isReply = false;
            };
        };
        // Format starred message embed
        const starEmbed = new EmbedBuilder()
            .setColor(globalVars.embedColor)
            .setTitle(`${boardEmote}${messageReaction.count}`)
            .setURL(targetMessage.url)
            .setThumbnail(avatar)
            .setImage(messageImage)
            .setFooter({ text: targetMessage.author.username })
            .setTimestamp(targetMessage.createdTimestamp);
        if (targetMessage.content) starEmbed.setDescription(targetMessage.content);
        starEmbed.addFields([{ name: `Sent:`, value: `By ${targetMessage.author} in ${targetMessage.channel}\nContext: ${targetMessage.url}`, inline: false }]);
        if (isReply && replyMessage && replyMessage.author && replyMessage.content.length > 0) starEmbed.addFields([{ name: `Replying to:`, value: `"${replyMessage.content.slice(0, 950)}"\n-${replyMessage.author}`, inline: true }]);
        starboardEmbeds.unshift(starEmbed);
        if (messageReaction.count == 0 && messageDB) {
            // If star amount is 0 now, delete starboard message and database entry
            let starChannel = await client.channels.fetch(messageDB.starboard_channel_id);
            await starChannel.messages.fetch(messageDB.starboard_message_id).then(m => {
                m.delete();
            });
            await messageDB.destroy();
            return;
        } else if (messageDB) {
            // Update existing entry otherwise
            let starChannel = await client.channels.fetch(messageDB.starboard_channel_id);
            let starMessage = await starChannel.messages.fetch(messageDB.starboard_message_id);
            if (!starMessage) return;
            if (starChannel !== starboard) return; // Fix cross-updating between starboard and evil starboard
            await starMessage.edit({ embeds: starboardEmbeds });
            return;
        } else {
            return;
        };

    } catch (e) {
        logger({ exception: e, client: client });
    };
};