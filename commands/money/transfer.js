import {
    SlashCommandBuilder,
    SlashCommandIntegerOption,
    SlashCommandUserOption
} from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import {
    getMoney,
    addMoney
} from "../../database/dbServices/user.api.js";

export default async (interaction, ephemeral) => {
    try {
        ephemeral = false;
        const currentBalance = await getMoney(interaction.user.id);
        let transferAmount = interaction.options.getInteger("amount");
        let transferTarget = interaction.options.getUser("user");
        let userBalance = `${Math.floor(currentBalance)}${globalVars.currency}`;

        if (transferTarget == interaction.user) return sendMessage({ client: interaction.client, interaction: interaction, content: `You can't transfer money to yourself.` });
        if (transferAmount > currentBalance) return sendMessage({ client: interaction.client, interaction: interaction, content: `You only have ${userBalance}.` });

        addMoney(interaction.user.id, -transferAmount);
        addMoney(transferTarget.id, transferAmount);

        return sendMessage({ client: interaction.client, interaction: interaction, content: `Transferred ${transferAmount}${globalVars.currency} to ${transferTarget}.`, ephemeral: ephemeral });

    } catch (e) {
        logger({ exception: e, interaction: interaction });
    };
};

// Integer options
const amountOption = new SlashCommandIntegerOption()
    .setName("amount")
    .setDescription("Amount to transfer.")
    .setMinValue(1)
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