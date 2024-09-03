import {
    InteractionContextType,
    SlashCommandBuilder,
    SlashCommandBooleanOption
} from "discord.js";
import forever from "forever";
import sendMessage from "../../util/sendMessage.js";
import isOwner from "../../util/perms/isOwner.js";
import getTime from "../../util/getTime.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import config from "../../config.json" with { type: "json" };

export default async (interaction) => {
    let ownerBool = await isOwner(interaction.client, interaction.user);
    if (!ownerBool) return sendMessage({ interaction: interaction, content: globalVars.lackPermsString });

    let removeInteractions = false;
    let interactionsArg = interaction.options.getBoolean("remove-interactions");
    if (interactionsArg === true) removeInteractions = interactionsArg;

    let timestamp = getTime();
    let shutdownString = "Shutting down.";
    if (removeInteractions) shutdownString += "\nRemoving all slash commands, context menus etc. This might take a bit.";
    await sendMessage({ interaction: interaction, content: shutdownString });

    if (removeInteractions) {
        await interaction.deferReply({ ephemeral: true });
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
        forever.stopAll();
    } catch (e) {
        console.log(e);
    };
    console.log(`Bot killed by **${interaction.user.username}**. (${timestamp})`);

    await interaction.client.destroy();
    return process.exit();
};

export const guildID = config.devServerID;

// Boolean options
const removeInteractionsOption = new SlashCommandBooleanOption()
    .setName("remove-interactions")
    .setDescription("Remove all interactions?");
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("kill")
    .setDescription("Shuts down bot.")
    .setContexts([InteractionContextType.Guild])
    .addBooleanOption(removeInteractionsOption);