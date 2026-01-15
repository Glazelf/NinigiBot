import {
    SlashCommandBuilder,
    SlashCommandStringOption,
    SlashCommandBooleanOption,
    codeBlock
} from "discord.js";
import owoify from "owoify-js";
import sendMessage from "../../util/discord/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

export default async (interaction: any, messageFlags: any) => {
    // TODO: Sanitize input somehow
    await interaction.deferReply({ flags: messageFlags });

    let input = interaction.options.getString("input");
    let severity = interaction.options.getString("severity");
    if (!severity) severity = "owo";

    let inputOwOified = owoify.default(input, severity);
    let returnString = codeBlock("fix", inputOwOified);

    return sendMessage({ interaction: interaction, content: returnString });
};

const severityChoices = [
    { name: "1. OwO", value: "owo" },
    { name: "2. UwU", value: "uwu" },
    { name: "3. UvU", value: "uvu" }
];

// String options
const inputOption = new SlashCommandStringOption()
    .setName("input")
    .setDescription("Text to OwOify.")
    .setMaxLength(1500) // OwOify makes the string significantly longer, so putting the max length close to 2000 risks overflowing
    .setRequired(true);
const severityOption = new SlashCommandStringOption()
    .setName("severity")
    .setDescription("Severity of OwOification.")
    .setChoices(severityChoices);
// Boolean options
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("owoify")
    .setDescription("OwOify text.")
    .addStringOption(inputOption)
    .addStringOption(severityOption)
    .addBooleanOption(ephemeralOption);