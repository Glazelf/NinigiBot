const Discord = require("discord.js");
exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');

        let message = await interaction.channel.messages.fetch(interaction.targetId);
        let returnString = `Here's the link(s) to the assets you requested:`;
        let replyMessage = null;
        let stickerLink = null;
        let noStickerString = `This only works for messages with stickers attached.`;
        if (!message.stickers || !message.stickers.first()) return sendMessage({ client: client, interaction: interaction, content: noStickerString });
        if (message.stickers.size == 1) {
            returnString += `\n${message.stickers.first().name} ${message.stickers.first().url}`;
        } else if (message.stickers.size > 1) {
            await message.stickers.forEach(sticker => {
                returnString += `\n${sticker.name} ${sticker.url}`;
            });
        } else {
            return sendMessage({ client: client, interaction: interaction, content: noStickerString });
        };
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