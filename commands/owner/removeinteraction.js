import {
    InteractionContextType,
    SlashCommandBuilder,
    SlashCommandStringOption,
    inlineCode
} from "discord.js";
import sendMessage from "../../util/discord/sendMessage.js";
import isOwner from "../../util/discord/perms/isOwner.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

export default async (interaction) => {
    let ownerBool = await isOwner(interaction.client, interaction.user);
    if (!ownerBool) return sendMessage({ interaction: interaction, content: globalVars.lackPermsString });

    await interaction.deferReply();

    let interactionName = interaction.options.getString("interaction-name");
    let guildID = interaction.options.getString("guild-id");

    let commands = await interaction.client.application.commands.fetch();
    let command = commands.find(c => c.name === interactionName);
    if (!command) return sendMessage({ interaction: interaction, content: `Command ${inlineCode(interactionName)} not found.` });

    try {
        await interaction.client.application.commands.delete(command.id, guildID);
    } catch (e) {
        // console.log();
        return sendMessage({ interaction: interaction, content: `Failed to delete ${inlineCode(interactionName)}.` });
    };
    return sendMessage({ interaction: interaction, content: `Deleted interaction ${inlineCode(interactionName)}.` });
};

export const guildID = process.env.DEV_SERVER_ID;

// String options
const interactionNameOption = new SlashCommandStringOption()
    .setName("interaction-name")
    .setDescription("Interaction to remove.")
    .setRequired(true);
const guildIDOption = new SlashCommandStringOption()
    .setName("guild-id")
    .setDescription("ID of guild.");
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("removeinteraction")
    .setDescription("Remove an interaction.")
    .setContexts([InteractionContextType.Guild])
    .addStringOption(interactionNameOption)
    .addStringOption(guildIDOption);