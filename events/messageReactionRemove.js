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
        // Check if message reaction counts are valid and that reaction is a star, different check from messageReactionAdd because count can be 0 here
        if (messageReaction.count == null || messageReaction.count == undefined) messageReaction = await messageReaction.fetch().catch(e => { return null; });
        if (!messageReaction) return;
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
        let starboardMessage = await getStarboardMessage({ messageReaction: messageReaction, targetMessage: targetMessage, boardEmote: boardEmote });
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
            let starChannel = null;
            let starMessage = null;
            try {
                starChannel = await client.channels.fetch(messageDB.starboard_channel_id);
                starMessage = await starChannel.messages.fetch(messageDB.starboard_message_id);
            } catch (e) {
                return;
            };
            if (!starMessage) return;
            if (starChannel !== starboard) return; // Fix cross-updating between starboard and evil starboard
            await starMessage.edit(starboardMessage);
            return;
        } else {
            return;
        };

    } catch (e) {
        logger({ exception: e, client: client });
    };
};