import {
    SlashCommandBooleanOption,
    SlashCommandBuilder
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import { getMoney } from "../../database/dbServices/user.api.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

export default async (interaction, ephemeral) => {
    let ephemeralArg = interaction.options.getBoolean("ephemeral");
    if (ephemeralArg !== null) ephemeral = ephemeralArg;
    let dbBalance = await getMoney(interaction.user.id);
    return sendMessage({ interaction: interaction, content: `You have ${Math.floor(dbBalance)}${globalVars.currency}.`, ephemeral: ephemeral });
};

// Boolean options
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Shows how much money you have.")
    .addBooleanOption(ephemeralOption);