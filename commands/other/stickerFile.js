import {
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    hyperlink
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";

const noStickerString = `This only works for messages with stickers attached.`;

export default async (interaction) => {
    let returnString = `Here's the link(s) to the assets you requested:`;
    let message = interaction.options._hoistedOptions[0].message;
    if (!message.stickers || !message.stickers.first()) return sendMessage({ interaction: interaction, content: noStickerString });

    await message.stickers.forEach(sticker => {
        returnString += `\n${hyperlink(sticker.name, sticker.url)}`;
    });
    return sendMessage({ interaction: interaction, content: returnString });
};

export const commandObject = new ContextMenuCommandBuilder()
    .setName("Sticker File")
    .setType(ApplicationCommandType.Message);