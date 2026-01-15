import {
    MessageFlags,
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    hyperlink,
    hideLinkEmbed
} from "discord.js";
import sendMessage from "../../util/discord/sendMessage.js";

const noAssetsString = `This only works for messages with attachments or stickers.`;

export default async (interaction: any, messageFlags: any) => {
    messageFlags.add(MessageFlags.Ephemeral);
    let returnString = `Here's the assets you requested.\n`;
    let message = interaction.options._hoistedOptions[0].message;

    let messageStickers = message.stickers;
    let messageAttachments = message.attachments;
    message.messageSnapshots.forEach(snapshot => {
        messageStickers = messageStickers.concat(snapshot.stickers);
        messageAttachments = messageAttachments.concat(snapshot.attachments);
    });

    const messageHasStickers = messageStickers.size > 0;
    const messageHasAttachments = messageAttachments.size > 0;
    if (!messageHasAttachments && !messageHasStickers) return sendMessage({ interaction: interaction, content: noAssetsString, flags: messageFlags });

    if (messageHasStickers) returnString += `Sticker(s):\n${addAttachmentString(messageStickers)}\n`;
    if (messageHasAttachments) returnString += `Attachment(s):\n${addAttachmentString(messageAttachments)}\n`;
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