import Discord from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";

export default async (client, interaction) => {
    try {
        let message = await interaction.channel.messages.fetch(interaction.targetId);
        let returnString = `Here's the link(s) to the assets you requested:`;
        let noStickerString = `This only works for messages with stickers attached.`;
        if (!message.stickers || !message.stickers.first()) return sendMessage({ client: client, interaction: interaction, content: noStickerString });

        if (message.stickers.size == 1) {
            returnString += `\n[${message.stickers.first().name}](${message.stickers.first().url})`;
        } else if (message.stickers.size > 1) {
            await message.stickers.forEach(sticker => {
                returnString += `\n${sticker.name} ${sticker.url}`;
            });
        } else {
            return sendMessage({ client: client, interaction: interaction, content: noStickerString });
        };
        return sendMessage({ client: client, interaction: interaction, content: returnString });

    } catch (e) {
        logger(e, client, interaction);
    };
};

export const config = {
    name: "StickerFile",
    type: Discord.ApplicationCommandType.Message
};