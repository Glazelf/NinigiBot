import {
    SlashCommandBuilder,
    SlashCommandIntegerOption,
    SlashCommandUserOption
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import {
    getMoney,
    addMoney
} from "../../database/dbServices/user.api.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

export default async (interaction, ephemeral) => {
    ephemeral = false;
    const currentBalance = await getMoney(interaction.user.id);
    let transferAmount = interaction.options.getInteger("amount");
    let transferTarget = interaction.options.getUser("user");
    let userBalance = `${Math.floor(currentBalance)}${globalVars.currency}`;

    if (transferTarget == interaction.user) return sendMessage({ interaction: interaction, content: `You can't transfer money to yourself.` });
    if (transferAmount > currentBalance) return sendMessage({ interaction: interaction, content: `You only have ${userBalance}.` });

    addMoney(interaction.user.id, -transferAmount);
    addMoney(transferTarget.id, transferAmount);

    return sendMessage({ interaction: interaction, content: `Transferred ${transferAmount}${globalVars.currency} to ${transferTarget}.`, ephemeral: ephemeral });
};

// Integer options
const amountOption = new SlashCommandIntegerOption()
    .setName("amount")
    .setDescription("Amount to transfer.")
    .setMinValue(1)
    .setAutocomplete(true)
    .setRequired(true);
// User options
const userOption = new SlashCommandUserOption()
    .setName("user")
    .setDescription("User to transfer to.")
    .setRequired(true);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("transfer")
    .setDescription("Give money to another user.")
    .addUserOption(userOption)
    .addIntegerOption(amountOption);