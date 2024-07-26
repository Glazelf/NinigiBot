import {
    SlashCommandBuilder,
    SlashCommandStringOption
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import isOwner from "../../util/perms/isOwner.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import config from "../../config.json" with { type: "json" };

export default async (interaction) => {
    let ownerBool = await isOwner(interaction.client, interaction.user);
    if (!ownerBool) return sendMessage({ interaction: interaction, content: globalVars.lackPermsString });

    await interaction.deferReply({ ephemeral: true });

    let interactionName = interaction.options.getString("interaction-name");
    let guildID = interaction.options.getString("guild-id");

    let commands = await interaction.client.application.commands.fetch();
    let command = commands.find(c => c.name === interactionName);
    if (!command) return sendMessage({ interaction: interaction, content: `Command \`${interactionName}\` not found.` });

    try {
        await interaction.client.application.commands.delete(command.id, guildID);
    } catch (e) {
        // console.log();
        return sendMessage({ interaction: interaction, content: `Failed to delete \`${interactionName}\`.` });
    };
    return sendMessage({ interaction: interaction, content: `Deleted interaction \`${interactionName}\`.` });
};

export const guildID = config.devServerID;

// String options
const interactionNameOption = new SlashCommandStringOption()
    .setName("interaction-name")
    .setDescription("Interaction to remove")
    .setRequired(true);
const guildIDOption = new SlashCommandStringOption()
    .setName("guild-id")
    .setDescription("ID of guild.");
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("removeinteraction")
    .setDescription("Remove an interaction.")
    .setDMPermission(false)
    .addStringOption(interactionNameOption)
    .addStringOption(guildIDOption);