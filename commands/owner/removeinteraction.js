import {
    SlashCommandBuilder,
    SlashCommandStringOption
} from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import isOwner from "../../util/isOwner.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import config from "../../config.json" with { type: "json" };

export default async (interaction) => {
    try {
        let ownerBool = await isOwner(client, interaction.user);
        if (!ownerBool) return sendMessage({ client: interaction.client, interaction: interaction, content: globalVars.lackPermsString });

        await interaction.deferReply({ ephemeral: true });

        let interactionName = interaction.options.getString("interaction-name");
        let guildID = interaction.options.getString("guild-id");

        let commands = await interaction.clientapplication.commands.fetch();
        let command = commands.find(c => c.name === interactionName);
        if (!command) return sendMessage({ client: interaction.client, interaction: interaction, content: `Command \`${interactionName}\` not found.` });

        try {
            await interaction.clientapplication.commands.delete(command.id, guildID);
        } catch (e) {
            // console.log();
            return sendMessage({ client: interaction.client, interaction: interaction, content: `Failed to delete \`${interactionName}\`.` });
        };
        return sendMessage({ client: interaction.client, interaction: interaction, content: `Deleted interaction \`${interactionName}\`.` });

    } catch (e) {
        logger({ exception: e, interaction: interaction });
    };
};

export const guildIDs = [config.devServerID];

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