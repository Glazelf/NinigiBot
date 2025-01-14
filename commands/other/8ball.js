import {
    codeBlock,
    SlashCommandBuilder,
    SlashCommandStringOption,
    SlashCommandBooleanOption
} from "discord.js";
import sendMessage from "../../util/discord/sendMessage.js";
import randomNumber from "../../util/math/randomNumber.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

const answers = [
    //// Lucien Cohen answers
    // Positive (10)
    "It is certain",
    "It is decidedly so",
    "Without a doubt",
    "Yes definetly",
    "You may rely on it",
    "As I see it, yes",
    "Most likely",
    "Outlook good",
    "Yes",
    "Signs point to yes",
    // Neutral (5)
    "Reply hazy, try again",
    "Ask again later",
    "Better not tell you now",
    "Cannot predict now",
    "Concentrate and ask again",
    // Negative (5)
    "Don't count on it",
    "My reply is no",
    "My sources say no",
    "Outlook not so good",
    "Very doubtful",
    //// Custom answers
    // Positive
    "Definitely",
    "There is no other possibility",
    "If you want it enough",
    "I will make it so",
    "...Yes?",
    "For sure",
    "The stars have willed it so",
    "If it will make you stop bothering me, yes",
    "This is the only timeline where that is the case",
    // Neutral
    "Maybe someday",
    "Try asking again",
    "It is possible",
    "Help me I'm stuck inside a Discord bot writing 8ball replies",
    "42",
    "You know the answer in your heart",
    "\*Explodes*",
    "Whatever, honestly",
    // Negative
    "Nothing",
    "Neither",
    "I don't think so",
    "No",
    "Probably not"
];

export default async (interaction, messageFlags) => {
    let input = interaction.options.getString("input");
    const randomAnswer = answers[randomNumber(0, answers.length)];
    let returnString = `Your question was:${codeBlock("fix", input)}The 8ball says: "${randomAnswer}".`;
    return sendMessage({ interaction: interaction, content: returnString, flags: messageFlags });
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
