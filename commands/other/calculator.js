import {
    codeBlock,
    SlashCommandBuilder,
    SlashCommandStringOption,
    SlashCommandBooleanOption,
    hyperlink,
    hideLinkEmbed
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

const maxMessageLength = 2000;
const noInputString = `You need to provide a valid input.`;
const sanitizeValues = [
    " ",
    "`",
    '"',
    "'",
    "{",
    "}",
    "[",
    "]",
    "<",
    ">",
    "&",
    "$"
];

export default async (interaction, ephemeral) => {
    let ephemeralArg = interaction.options.getBoolean("ephemeral");
    if (ephemeralArg !== null) ephemeral = ephemeralArg;
    await interaction.deferReply({ ephemeral: ephemeral });

    let input = interaction.options.getString("input");
    // Sanitize input
    let calcInput = input.replace(/x/g, "*").replace(/,/g, ".").replace(/[a-zA-Z]/gm, '');
    if (!calcInput.includes("!=")) calcInput = calcInput.replace("=", "==");
    sanitizeValues.forEach(function (value) {
        calcInput = calcInput.replace(value, "");
    });
    if (!calcInput) return sendMessage({ interaction: interaction, content: noInputString });
    let evaled = null;
    try {
        evaled = eval(calcInput);
    } catch (e) {
        // console.log(e);
        return sendMessage({ interaction: interaction, content: noInputString });
    };
    // Test out rounding based on remainder sometime
    // let remainder = evaled % 1;
    // Amount of 0's is the amount of decimals to round to
    let rounded = Math.round((evaled + Number.EPSILON) * 10000) / 10000;
    let output = codeBlock("js", `${rounded} (${calcInput})`);
    if (calcInput.includes("^")) output += `Note: Exponentials (^) are currently ${hyperlink("not supported", hideLinkEmbed("https://github.com/Glazelf/NinigiBot/issues/436"))}.`;
    let returnString = output;
    if (output.length > maxMessageLength) returnString = codeBlock("js", rounded.toString());

    return sendMessage({ interaction: interaction, content: returnString });
};

// String options
const inputOption = new SlashCommandStringOption()
    .setName("input")
    .setDescription("Input to calculate.")
    .setMaxLength(maxMessageLength - 50)
    .setRequired(true);
// Boolean options
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("calculator")
    .setDescription("Calculate input.")
    .addStringOption(inputOption)
    .addBooleanOption(ephemeralOption);