import getStarboardMessage from "../util/getStarboardMessage.js";
import logger from "../util/logger.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };

const starboardEmote = "⭐";
const altboardChannelID = "1234922298255872092"; // Evil starboard
const altboardEmote = "<:nostar:780198211913646130>";
const altboardEmoteID = altboardEmote.replace(/[^0-9]+/g, "");

export default async (client, messageReaction) => {
    try {
        let boardEmote = starboardEmote;
        // Check if message has reactions and if reaction is a star
        if (!messageReaction.count) messageReaction = await messageReaction.fetch().catch(e => { return null; });
        if (!messageReaction) return;
        // Check if message is reacting to nostar in Shinx server
        const isNoStar = (messageReaction.emoji.id === altboardEmoteID && messageReaction.message.guildId == globalVars.ShinxServerID);
        if (messageReaction.emoji.name !== boardEmote && !isNoStar) return;
        // Try to fetch message
        // let targetMessage = await messageReaction.message.channel.messages.fetch(messageReaction.message.id, { force: true });
        let targetMessage = messageReaction.message; // No fetch is a test, if this doesn't work, try fetching with { force: true }
        if (!targetMessage) return;
        // Try to find the starboard channel, won't exist if server hasn't set one
        let starboardChannel, starboard;
        let serverApi = await import("../database/dbServices/server.api.js");
        serverApi = await serverApi.default();
        if (isNoStar) { // Find altboard channel
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
        // Try to find the star requirement. If it doesn't exist, use the default
        let starLimit = await serverApi.StarboardLimits.findOne({ where: { server_id: messageReaction.message.guild.id } });
        if (starLimit) {
            starLimit = starLimit.star_limit;
        } else {
            starLimit = globalVars.starboardLimit;
        };
        let starboardMessage = await getStarboardMessage({ messageReaction: messageReaction, targetMessage: targetMessage, boardEmote: boardEmote });
        // Check if message already existed in database (was posted to starboard) or if star amount simply changed
        if (messageReaction.count >= starLimit && !messageDB) {
            // Send message then push data to database
            await sendStarboardMessage(starboardMessage, targetMessage);
            return;
        } else if (messageDB) {
            // Update existing starboard message and database entry
            let starChannel = null;
            let starMessage = null;
            try {
                starChannel = await client.channels.fetch(messageDB.starboard_channel_id);
                starMessage = await starChannel.messages.fetch(messageDB.starboard_message_id);
            } catch (e) {
                if (starChannel && !starMessage) {
                    await messageDB.destroy();
                    await sendStarboardMessage(starboardMessage, targetMessage);
                };
                return;
            };
            if (!starMessage) return;
            if (starChannel !== starboard) return; // Fix cross-updating between starboard and evil starboard
            await starMessage.edit(starboardMessage);
            // Try to pin messages with double stars
            if (messageReaction.count >= starLimit * 2) starMessage.pin().catch(e => {
                // console.log(e);
                return;
            });
            return;
        } else {
            return;
        };

        async function sendStarboardMessage(starboardMessage, targetMessage) {
            await starboard.send(starboardMessage).then(async (m) => await serverApi.StarboardMessages.upsert({ channel_id: targetMessage.channel.id, message_id: targetMessage.id, starboard_channel_id: m.channel.id, starboard_message_id: m.id }));
        };

    } catch (e) {
        logger({ exception: e, client: client });
    };
};