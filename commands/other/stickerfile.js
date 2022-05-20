exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");

        let message = await interaction.channel.messages.fetch(interaction.targetId);

        let returnString = `Here's the link(s) to the assets you requested:`;
        let replyMessage = null;
        let stickerLink = null;

        // Add support to get ALL stickers from a message
        if (message.stickers && message.stickers.first()) {
            stickerLink = message.stickers.first().url;
        } else if (replyMessage && replyMessage.stickers.first()) {
            stickerLink = replyMessage.stickers.first().url;
        } else {
            return sendMessage({ client: client, interaction: interaction, content: `Please provide a sticker to convert or reply to a message containing a sticker.` });
        };

        returnString += `\n-Sticker link: <${stickerLink}>`
        return sendMessage({ client: client, interaction: interaction, content: returnString });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "StickerFile",
    type: "MESSAGE"
};