import {
    MessageFlags,
    InteractionContextType,
    SlashCommandBuilder,
    SlashCommandIntegerOption,
    SlashCommandUserOption
} from "discord.js";
import sendMessage from "../../util/discord/sendMessage.js";
import isOwner from "../../util/discord/perms/isOwner.js";
import { addExperience } from "../../database/dbServices/shinx.api.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

export default async (interaction, messageFlags) => {
    messageFlags.add(MessageFlags.Ephemeral);
    let ownerBool = await isOwner(interaction.client, interaction.user);
    if (!ownerBool) return sendMessage({ interaction: interaction, content: globalVars.lackPermsString, flags: messageFlags.add(MessageFlags.Ephemeral) });

    let userArg = interaction.options.getUser("user");
    if (!userArg) return sendMessage({ interaction: interaction, content: `Could not find user.`, flags: messageFlags.add(MessageFlags.Ephemeral) });
    let expArg = interaction.options.getInteger("amount");
    await addExperience(userArg.id, expArg);
    returnString = `Added ${expArg} points to ${userArg}'s shinx!`;
    return sendMessage({ interaction: interaction, content: returnString, flags: messageFlags });
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