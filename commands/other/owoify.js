import {
    codeBlock,
    SlashCommandBuilder,
    SlashCommandStringOption,
    SlashCommandBooleanOption
} from "discord.js";
import owoify from "owoify-js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

export default async (interaction, ephemeral) => {
    let ephemeralArg = interaction.options.getBoolean("ephemeral");
    if (ephemeralArg !== null) ephemeral = ephemeralArg;
    await interaction.deferReply({ ephemeral: ephemeral });

    let input = interaction.options.getString("input");
    let severity = interaction.options.getString("severity");
    if (!severity) severity = "owo";

    let inputOwOified = owoify.default(input, severity);
    let returnString = codeBlock("fix", inputOwOified);

    return sendMessage({ interaction: interaction, content: returnString, ephemeral: ephemeral });
};

let severityChoices = [
    { name: "1. OwO", value: "owo" },
    { name: "2. UwU", value: "uwu" },
    { name: "3. UvU", value: "uvu" }
];

// String options
const inputOption = new SlashCommandStringOption()
    .setName("input")
    .setDescription("Text to OwOify")
    .setMaxLength(1950) // Set limit shortly under 2000 character limit to avoid going over with code block text etc.
    .setRequired(true);
const severityOption = new SlashCommandStringOption()
    .setName("severity")
    .setDescription("Severity of OwOification")
    .setChoices(severityChoices);
// Boolean options
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("input")
    .setDescription("OwOify text.")
    .addStringOption(inputOption)
    .addStringOption(severityOption)
    .addBooleanOption(ephemeralOption);