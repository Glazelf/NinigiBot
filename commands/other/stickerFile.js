import {
    ContextMenuCommandBuilder,
    ApplicationCommandType
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";

let returnString = `Here's the link(s) to the assets you requested:`;
let noStickerString = `This only works for messages with stickers attached.`;

export default async (interaction) => {
    let message = await interaction.channel.messages.fetch(interaction.targetId);
    if (!message.stickers || !message.stickers.first()) return sendMessage({ interaction: interaction, content: noStickerString });

    await message.stickers.forEach(sticker => {
        returnString += `\n[${sticker.name}](${sticker.url})`;
    });
    return sendMessage({ interaction: interaction, content: returnString });
};

export const commandObject = new ContextMenuCommandBuilder()
    .setName("Sticker File")
    .setType(ApplicationCommandType.Message);