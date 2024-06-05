import Discord from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import { getMoney, addMoney } from "../../database/dbServices/user.api.js";

export default async (client, interaction, ephemeral) => {
    try {
        ephemeral = false;
        const currentBalance = await getMoney(interaction.user.id);
        let transferAmount = interaction.options.getInteger("amount");
        let transferTarget = interaction.options.getUser("user");
        let userBalance = `${Math.floor(currentBalance)}${globalVars.currency}`;

        if (transferTarget == interaction.user) return sendMessage({ client: client, interaction: interaction, content: `You can't transfer money to yourself.` });
        if (transferAmount > currentBalance) return sendMessage({ client: client, interaction: interaction, content: `You only have ${userBalance}.` });
        if (transferAmount < 1) return sendMessage({ client: client, interaction: interaction, content: `Please enter an amount greater than zero.` });

        addMoney(interaction.user.id, -transferAmount);
        addMoney(transferTarget.id, transferAmount);

        return sendMessage({ client: client, interaction: interaction, content: `Transferred ${transferAmount}${globalVars.currency} to ${transferTarget}.`, ephemeral: ephemeral });

    } catch (e) {
        logger(e, client, interaction);
    };
};

export const config = {
    name: "transfer",
    description: "Give money to another user.",
    options: [{
        name: "user",
        type: Discord.ApplicationCommandOptionType.User,
        description: "Specify user.",
        required: true
    }, {
        name: "amount",
        type: Discord.ApplicationCommandOptionType.Integer,
        description: "Specify amount.",
        required: true
    }]
};