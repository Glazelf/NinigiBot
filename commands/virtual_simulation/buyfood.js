import {
    SlashCommandBuilder,
    SlashCommandIntegerOption
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import { buyFood } from "../../database/dbServices/user.api.js";

export default async (interaction) => {
    let ephemeral = true;
    let res, returnString;
    let master = interaction.user;
    let amountArg = interaction.options.getInteger("amount");
    res = await buyFood(master.id, amountArg);
    returnString = res ? `Added ${amountArg}🍗 to your account!` : `Not enough money!`;
    return sendMessage({ interaction: interaction, content: returnString, ephemeral: ephemeral || res != true });
};

// Integer options
const amountOption = new SlashCommandIntegerOption()
    .setName("amount")
    .setDescription("Amount of food to buy.")
    .setMinValue(1)
    .setRequired(true);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("buyfood")
    .setDescription("Buy food for your Shinx.")
    .addIntegerOption(amountOption);