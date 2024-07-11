import {
    codeBlock,
    SlashCommandBuilder,
    SlashCommandStringOption,
    SlashCommandBooleanOption
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

const answers = ["Maybe someday", "Nothing", "Neither", "I don't think so", "No", "Yes", "Try asking again", "Definitely", "Probably not"];

export default async (interaction, ephemeral) => {
    let input = interaction.options.getString("input");
    let ephemeralArg = interaction.options.getBoolean("ephemeral");
    if (ephemeralArg !== null) ephemeral = ephemeralArg;
    const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
    let returnString = `Your question was:${codeBlock("fix", input)}The 8ball says: "${randomAnswer}.".`;
    return sendMessage({ interaction: interaction, content: returnString, ephemeral: ephemeral });
};

// String options
const inputOption = new SlashCommandStringOption()
    .setName("input")
    .setDescription("Your burning question.")
    .setRequired(true);
// Boolean options
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("Ask the magic 8ball for knowledge.")
    .addStringOption(inputOption)
    .addBooleanOption(ephemeralOption);