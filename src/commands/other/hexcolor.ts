import {
    MessageFlags,
    EmbedBuilder,
    SlashCommandBuilder,
    SlashCommandStringOption,
    SlashCommandBooleanOption,
    AttachmentBuilder,
    inlineCode
} from "discord.js";
import Canvas from "canvas";
import sendMessage from "../../util/discord/sendMessage.js";

import globalVars from "../../objects/globalVars.json";

export default async (interaction: any, messageFlags: any) => {
    let hexInput = interaction.options.getString("hex");
    let rgb = hexToRgb(hexInput);
    if (!hexInput.startsWith("#")) hexInput = `#${hexInput}`;
    if (!rgb) return sendMessage({ interaction: interaction, content: `Please provide a valid hex. Color hexes are 6 characters long using characters ${inlineCode("0-9")} and ${inlineCode("A-F")}.`, flags: messageFlags.add(MessageFlags.Ephemeral) });

    let imgWidth = 225;
    let imgHeight = 100;
    let canvas = Canvas.createCanvas(imgWidth, imgHeight);
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`;
    ctx.fillRect(0, 0, imgWidth, imgHeight);
    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: "hexcolor.png" });

    let hexColorEmbed = new EmbedBuilder()
        .setColor(hexInput)
        .setTitle(hexInput)
        .setImage(`attachment://${attachment.name}`);
    return sendMessage({ interaction: interaction, embeds: [hexColorEmbed], files: [attachment], flags: messageFlags });
};

function hexToRgb(hex: any) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

// String options
const hexOption = new SlashCommandStringOption()
    .setName("hex")
    .setDescription("Hexadecimal to convert.")
    .setMinLength(6)
    .setMaxLength(6)
    .setRequired(true);
// Booleann options
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("hexcolor")
    .setDescription("Creates color image from hexadecimal.")
    .addStringOption(hexOption)
    .addBooleanOption(ephemeralOption);