import {
    SlashCommandBuilder,
    SlashCommandIntegerOption,
    SlashCommandUserOption
} from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import isOwner from "../../util/isOwner.js";
import { addExperience } from "../../database/dbServices/shinx.api.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import config from "../../config.json" with { type: "json" };

export default async (interaction) => {
    try {
        ephemeral = true;
        let ownerBool = await isOwner(client, interaction.user);
        if (!ownerBool) return sendMessage({ client: interaction.client, interaction: interaction, content: globalVars.lackPermsString });

        let userArg = interaction.options.getUser("user");
        if (!userArg) return sendMessage({ client: interaction.client, interaction: interaction, content: `Could not find user.` });
        let expArg = interaction.options.getInteger("amount");
        await addExperience(userArg.id, expArg);
        returnString = `Added ${expArg} points to ${userArg}'s shinx!`;
        return sendMessage({ client: interaction.client, interaction: interaction, content: returnString, ephemeral: ephemeral });
    } catch (e) {
        logger({ exception: e, interaction: interaction });
    };
};

export const guildIDs = [config.devServerID];

// Integer options
const amountOption = new SlashCommandIntegerOption()
    .setName("amount")
    .setDescription("Amount of experience to add.")
    .setRequired(true);
// User options
const userOption = new SlashCommandUserOption()
    .setName("user")
    .setDescription("Specify user to give experience.")
    .setRequired(true);
export const commandObject = new SlashCommandBuilder()
    .setName("expadd")
    .setDescription("Add experience to a user's Shinx.")
    .setDMPermission(false)
    .addUserOption(userOption)
    .addIntegerOption(amountOption);