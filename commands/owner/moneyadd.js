import Discord from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import { getMoney, addMoney } from "../../database/dbServices/user.api.js";
import isOwner from "../../util/isOwner.js";

export default async (client, interaction) => {
    try {
        let ownerBool = await isOwner(client, interaction.user);
        if (!ownerBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        let currency = globalVars.currency;

        let transferTargetID = interaction.options.getString("user");
        let transferAmount = interaction.options.getInteger("amount");

        if (!transferTargetID) return sendMessage({ client: client, interaction: interaction, content: `Could not find user.` });

        let dbBalance = await getMoney(transferTargetID);
        let userBalance = `${Math.floor(dbBalance)}${currency}`;

        await addMoney(transferTargetID, +transferAmount);
        userBalance = `${Math.floor(dbBalance + transferAmount)}${currency}`;

        return sendMessage({ client: client, interaction: interaction, content: `Added ${transferAmount}${currency} to <@${transferTargetID}> (${transferTargetID}). They now have ${userBalance}.` });

    } catch (e) {
        logger(e, client, interaction);
    };
};

export const config = {
    name: "moneyadd",
    description: "Add money to a user.",
    serverID: ["759344085420605471"],
    options: [{
        name: "amount",
        type: Discord.ApplicationCommandOptionType.Integer,
        description: "Amount of money to add.",
        required: true
    }, {
        name: "user",
        type: Discord.ApplicationCommandOptionType.String,
        description: "Specify user by id.",
        required: true
    }]
};