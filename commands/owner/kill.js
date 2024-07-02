import {
    SlashCommandBuilder,
    SlashCommandBooleanOption
} from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import forever from "forever";
import isOwner from "../../util/isOwner.js";
import getTime from "../../util/getTime.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import config from "../../config.json" with { type: "json" };

export default async (interaction) => {
    try {
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
        // Ignore forever if fails, mostly for test-bots not running it.
        if (forever) {
            try {
                forever.stopAll();
            } catch (e) {
                console.log(e);
            };
        };
        console.log(`Bot killed by ${interaction.user.username}. (${timestamp})`);

        await interaction.client.destroy();
        return process.exit();

    } catch (e) {
        logger({ exception: e, interaction: interaction });
    };
};

export const guildIDs = [config.devServerID];

// Boolean options
const removeInteractionsOption = new SlashCommandBooleanOption()
    .setName("remove-interactions")
    .setDescription("Remove all interactions?");
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("kill")
    .setDescription("Shuts down bot.")
    .setDMPermission(false)
    .addBooleanOption(removeInteractionsOption);