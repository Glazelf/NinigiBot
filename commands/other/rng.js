import {
    SlashCommandBuilder,
    SlashCommandIntegerOption,
    SlashCommandBooleanOption
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import randomNumber from "../../util/randomNumber.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

export default async (interaction, ephemeral) => {
    let ephemeralArg = interaction.options.getBoolean("ephemeral");
    if (ephemeralArg !== null) ephemeral = ephemeralArg;
    let lowNumber = interaction.options.getInteger("number-min");
    let highNumber = interaction.options.getInteger("number-max");
    if (lowNumber > highNumber) [lowNumber, highNumber] = [highNumber, lowNumber]; // Flip variables in case lowNumber is higher. randomNumber() does this too but we do it again here to keep the end string sorted from low to high
    let randomValue = randomNumber(lowNumber, highNumber);

    return sendMessage({ interaction: interaction, content: `Your random number between \`${lowNumber}\` and \`${highNumber}\` is \`${randomValue}\`.`, ephemeral: ephemeral });
};

// Integer options
const minNumberOption = new SlashCommandIntegerOption()
    .setName("number-min")
    .setDescription("Minimum number.")
    .setRequired(true);
const maxNumberOption = new SlashCommandIntegerOption()
    .setName("number-max")
    .setDescription("Maximum number.")
    .setRequired(true);
// Boolean options
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("rng")
    .setDescription("Generate a random number.")
    .addIntegerOption(minNumberOption)
    .addIntegerOption(maxNumberOption)
    .addBooleanOption(ephemeralOption);