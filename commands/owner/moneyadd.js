import {
    SlashCommandBuilder,
    SlashCommandStringOption,
    SlashCommandIntegerOption
} from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import {
    getMoney,
    addMoney
} from "../../database/dbServices/user.api.js";
import isOwner from "../../util/isOwner.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import config from "../../config.json" with { type: "json" };

let currency = globalVars.currency;

export default async (client, interaction) => {
    try {
        let ownerBool = await isOwner(client, interaction.user);
        if (!ownerBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPermsString });

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

export const guildIDs = [config.devServerID];

// String options
const amountOption = new SlashCommandIntegerOption()
    .setName("amount")
    .setDescription("Amount of money to add.")
    .setRequired(true);
// Integer options
const userOption = new SlashCommandStringOption()
    .setName("user")
    .setDescription("Specify user by ID.")
    .setRequired(true);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("moneyadd")
    .setDescription("Add money to a user.")
    .setDMPermission(false)
    .addStringOption(userOption)
    .addIntegerOption(amountOption);