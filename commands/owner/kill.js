import {
    MessageFlags,
    InteractionContextType,
    PermissionFlagsBits,
    SlashCommandBuilder,
    SlashCommandBooleanOption
} from "discord.js";
import forever from "forever-monitor";
import sendMessage from "../../util/discord/sendMessage.js";
import isOwner from "../../util/discord/perms/isOwner.js";
import getTime from "../../util/getTime.js";
import formatName from "../../util/discord/formatName.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

export default async (interaction, messageFlags) => {
    messageFlags.remove(MessageFlags.Ephemeral);
    let ownerBool = await isOwner(interaction.client, interaction.user);
    if (!ownerBool) return sendMessage({ interaction: interaction, content: globalVars.lackPermsString, flags: messageFlags.add(MessageFlags.Ephemeral) });

    let removeInteractions = false;
    let interactionsArg = interaction.options.getBoolean("remove-interactions");
    if (interactionsArg === true) removeInteractions = interactionsArg;

    let timestamp = getTime();
    let shutdownString = "Shutting down.";
    if (removeInteractions) shutdownString += "\nRemoving all slash commands, context menus etc. This might take a bit.";
    await sendMessage({ interaction: interaction, content: shutdownString });

    if (removeInteractions) {
        await interaction.deferReply({ flags: messageFlags });
        // Delete all global commands
        await interaction.client.application.commands.set([]);
        // Delete all guild commands
        await interaction.client.guilds.cache.forEach(async (guild) => {
            guild.commands.set([]).catch(e => {
                return;
            });
        });
    };
    try {
        forever.kill();
    } catch (e) {
        console.log(e);
    };
    console.log(`Bot killed by ${formatName(interaction.user.username, false)}. (${timestamp})`);

    await interaction.client.destroy();
    return process.exit();
};

export const guildID = process.env.DEV_SERVER_ID;

// Boolean options
const removeInteractionsOption = new SlashCommandBooleanOption()
    .setName("remove-interactions")
    .setDescription("Remove all interactions?");
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("kill")
    .setDescription("Shuts down bot.")
    .setContexts([InteractionContextType.Guild])
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addBooleanOption(removeInteractionsOption);