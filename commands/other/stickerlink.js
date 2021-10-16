exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");

        let returnString = `Here's the link(s) to the assets you requested, **${message.member.user.tag}**:`;

        //// Would like to have emotes in this too, but currently impossible since bots can't seem to access the urls of emotes they can't personally use. Even though they can do this for stickers, lol.
        // if (!args[0] && !message.stickers.first()) return sendMessage(client, message, `Please provide either a sticker or an emote to convert.`);
        // if (args[0]) {
        //     let emote = Discord.GuildEmojiManager.resolveId(args[0])
        //     returnString += `\n-Emote link: ${emote}`;
        // };
        if (message.stickers.first()) {
            returnString += `\n-Sticker link: <${message.stickers.first().url}>`;
        } else {
            return sendMessage(client, message, `Please provide a sticker to convert.`);
        };

        return sendMessage(client, message, returnString);

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "stickerlink",
    aliases: [],
    description: "Converts a sticker to a file."
};