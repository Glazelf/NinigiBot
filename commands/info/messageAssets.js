import {
    MessageFlags,
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    hyperlink,
    hideLinkEmbed
} from "discord.js";
import sendMessage from "../../util/discord/sendMessage.js";

const noAssetsString = `This only works for messages with supported assets, like stickers, attached. Note that regular images are not included.`;

export default async (interaction, messageFlags) => {
    messageFlags.add(MessageFlags.Ephemeral);
    let returnString = `Here's the assets you requested.\n`;
    let message = interaction.options._hoistedOptions[0].message;

    const messageHasStickers = message.stickers.size > 0;
    const messageHasAttachments = message.attachments.size > 0;
    if (!messageHasAttachments && !messageHasStickers) return sendMessage({ interaction: interaction, content: noAssetsString, flags: messageFlags });

    if (messageHasStickers) returnString += `Sticker(s):\n${addAttachmentString(message.stickers)}\n`;
    if (messageHasAttachments) returnString += `Attachment(s):\n${addAttachmentString(message.attachments)}\n`;
    return sendMessage({ interaction: interaction, content: returnString, flags: messageFlags });
};

function addAttachmentString(collection) {
    let string = "";
    collection.forEach(item => {
        let url = item.url;
        if (item.proxyURL) url = item.proxyURL;
        string += `${hyperlink(item.name, hideLinkEmbed(url))}\n`;
    });
    return string;
};

export const commandObject = new ContextMenuCommandBuilder()
    .setName("Message Assets")
    .setType(ApplicationCommandType.Message);