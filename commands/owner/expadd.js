import {
    InteractionContextType,
    SlashCommandBuilder,
    SlashCommandIntegerOption,
    SlashCommandUserOption
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import isOwner from "../../util/perms/isOwner.js";
import { addExperience } from "../../database/dbServices/shinx.api.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

export default async (interaction) => {
    ephemeral = true;
    let ownerBool = await isOwner(interaction.client, interaction.user);
    if (!ownerBool) return sendMessage({ interaction: interaction, content: globalVars.lackPermsString });

    let userArg = interaction.options.getUser("user");
    if (!userArg) return sendMessage({ interaction: interaction, content: `Could not find user.` });
    let expArg = interaction.options.getInteger("amount");
    await addExperience(userArg.id, expArg);
    returnString = `Added ${expArg} points to ${userArg}'s shinx!`;
    return sendMessage({ interaction: interaction, content: returnString, ephemeral: ephemeral });
};

export const guildID = process.env.DEV_SERVER_ID;

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
    .setContexts([InteractionContextType.Guild])
    .addUserOption(userOption)
    .addIntegerOption(amountOption);