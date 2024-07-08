import { EmbedBuilder } from "discord.js";
import logger from "../util/logger.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };

let starboardEmote = "⭐";
const altboardChannelID = "1234922298255872092"; // Evil starboard
const altboardEmoteID = "780198211913646130";
const altboardEmote = `<:nostar:${altboardEmoteID}>`;

export default async (client, messageReaction) => {
    try {
        // Check if message has reactions and if reaction is a star
        if (!messageReaction.count) return;
        // Check if message is reacting to nostar in Shinx server
        const isNoStar = (messageReaction.emoji.id === altboardEmoteID && messageReaction.message.guildId == globalVars.ShinxServerID);
        if (messageReaction.emoji.name !== starboardEmote && !isNoStar) return;
        // Try to fetch message
        let targetMessage = await messageReaction.message.channel.messages.fetch(messageReaction.message.id);
        if (!targetMessage) return;
        // Try to find the starboard channel, won't exist if server hasn't set one
        let starboardChannel;
        let starboard;
        let serverApi = await import("../database/dbServices/server.api.js");
        serverApi = await serverApi.default();
        if (isNoStar) { // Find altboard channel
            starboardEmote = altboardEmote;
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
        // Try to find the star requirement. If it doesn't exist, use the default
        let starLimit = await serverApi.StarboardLimits.findOne({ where: { server_id: messageReaction.message.guild.id } });
        if (starLimit) {
            starLimit = starLimit.star_limit;
        } else {
            starLimit = globalVars.starboardLimit;
        };
        // Check for atached files
        let messageImage = null;
        let seperateFiles = null;
        if (targetMessage.attachments.size > 0) {
            messageImage = await targetMessage.attachments.first().url;
            // Videos can't be embedded unless you're X (formerly Twitter) or YouTube, so they are sent as seperate mesages
            if (messageImage.endsWith(".mp4")) seperateFiles = messageImage;
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
        // This implementation isn't supported by embed URLs, only by button urls. For some reason.
        // let messageURL = `discord://-/channels/${targetMessage.guild.id}/${targetMessage.channel.id}/${targetMessage.id}`;
        // Format the starboard embed message
        const starEmbed = new EmbedBuilder()
            .setColor(globalVars.embedColor)
            .setTitle(`${starboardEmote}${messageReaction.count}`)
            .setThumbnail(avatar)
            .setImage(messageImage)
            .setFooter({ text: targetMessage.author.username })
            .setTimestamp(targetMessage.createdTimestamp);
        if (targetMessage.content) starEmbed.setDescription(targetMessage.content);
        starEmbed.addFields([{ name: `Sent:`, value: `By ${targetMessage.author} in ${targetMessage.channel}\nContext: ${targetMessage.url}`, inline: false }]);
        if (isReply && replyString.length > 0) starEmbed.addFields([{ name: `Replying to:`, value: replyString, inline: true }]);
        // Check if message already existed in database (was posted to starboard) or if star amount simply changed
        if (messageReaction.count >= starLimit && !messageDB) {
            // Send message then push data to database
            await starboard.send({ embeds: [starEmbed] }).then(async (m) => await serverApi.StarboardMessages.upsert({ channel_id: targetMessage.channel.id, message_id: targetMessage.id, starboard_channel_id: m.channel.id, starboard_message_id: m.id }));
            return;
        } else if (messageDB) {
            // Update existing starboard message and database entry
            let starChannel = await client.channels.fetch(messageDB.starboard_channel_id);
            let starMessage = await starChannel.messages.fetch(messageDB.starboard_message_id);
            if (!starMessage) return;
            if (starChannel !== starboard) return; // Fix cross-updating between starboard and evil starboard
            await starMessage.edit({ embeds: [starEmbed] });
            // Try to pin messages with double stars
            if (messageReaction.count >= starLimit * 2) starMessage.pin().catch(e => {
                // console.log(e); 
            });
            return;
        } else {
            return;
        };

    } catch (e) {
        logger({ exception: e, client: client });
    };
};