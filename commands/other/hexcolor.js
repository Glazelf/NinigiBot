import {
    SlashCommandBuilder,
    SlashCommandStringOption,
    SlashCommandBooleanOption
} from "discord.js";
import { PassThrough } from "stream";
import PImage from "pureimage";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

export default async (interaction, ephemeral) => {
    let ephemeralArg = interaction.options.getBoolean("ephemeral");
    if (ephemeralArg !== null) ephemeral = ephemeralArg;

    let hexInput = interaction.options.getString("hex");
    let formattingHash = "#";
    let rgb = hexToRgb(hexInput);
    if (hexInput.startsWith("#")) formattingHash = "";

    if (!rgb) return sendMessage({ interaction: interaction, content: `Please provide a valid hex. Color hexes are 6 characters long using characters 0-9 and A-F.` });

    let imgWidth = 225;
    let imgHeight = 100;
    let img = PImage.make(imgWidth, imgHeight);
    let ctx = img.getContext('2d');
    ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`;
    ctx.fillRect(0, 0, imgWidth, imgHeight);

    const stream = new PassThrough();
    await PImage.encodePNGToStream(img, stream);

    return sendMessage({ interaction: interaction, content: `Here's the color for \`${formattingHash}${hexInput}\`:`, files: stream, ephemeral: ephemeral });
};

function hexToRgb(hex) {
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