exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");

        let returnString = `Here's the link(s) to the assets you requested, **${message.member.user.tag}**:`;
        let replyMessage = null;
        let stickerLink = null;

        if (message.reference) {
            if (message.reference) replyMessage = await message.channel.messages.fetch(message.reference.messageId);
            input = replyMessage.content;
            questionAskUser = replyMessage.author;
        };

        //// Would like to have emotes in this too, but currently impossible since bots can't seem to access the urls of emotes they can't personally use. Even though they can do this for stickers, lol.
        // if (!args[0] && !message.stickers.first()) return sendMessage({client: client, message: message, content: `Please provide either a sticker or an emote to convert.` });
        // if (args[0]) {
        //     let emote = Discord.GuildEmojiManager.resolveId(args[0])
        //     returnString += `\n-Emote link: ${emote}`;
        // };
        if (message.stickers && message.stickers.first()) {
            stickerLink = message.stickers.first().url;
        } else if (replyMessage && replyMessage.stickers.first()) {
            stickerLink = replyMessage.stickers.first().url;
        } else {
            return sendMessage({ client: client, message: message, content: `Please provide a sticker to convert or reply to a message containing a sticker.` });
        };

        returnString += `\n-Sticker link: <${stickerLink}>`

        return sendMessage({ client: client, message: message, content: returnString });

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