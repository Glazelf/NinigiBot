import {
    MessageFlags,
    InteractionContextType,
    GuildFeature,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    SlashCommandBuilder
} from "discord.js";
import sendMessage from "../../util/discord/sendMessage.js";

const modal = new ModalBuilder()
    .setCustomId('modMailModal')
    .setTitle('Mod Mail 📧');
const titleInput = new TextInputBuilder()
    .setCustomId('modMailTitle')
    .setLabel("Title your mail!")
    .setPlaceholder("Someone is harassing me.")
    .setStyle(TextInputStyle.Short)
    .setMinLength(5)
    .setMaxLength(256)
    .setRequired(true);
const descriptionInput = new TextInputBuilder()
    .setCustomId('modMailDescription')
    .setLabel("Elaborate on your problem.")
    .setPlaceholder("User BigYoshi28 (748199267725869127) is calling me a stinky nerd!")
    .setStyle(TextInputStyle.Paragraph)
    .setMinLength(10)
    .setMaxLength(1024)
    .setRequired(true);
const actionRow1 = new ActionRowBuilder()
    .addComponents(titleInput);
const actionRow2 = new ActionRowBuilder()
    .addComponents(descriptionInput);

modal.addComponents(actionRow1, actionRow2);

export default async (interaction, messageFlags) => {
    if (!interaction.guild.features.includes(GuildFeature.Community) || !interaction.guild.safetyAlertsChannel) return sendMessage({ interaction: interaction, content: "This server has Community features disabled.\nThese are required for this command to work properly.\nModmail will be sent to the same channel as community updates.", flags: messageFlags.add(MessageFlags.Ephemeral) });
    return interaction.showModal(modal);
};

// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("modmail")
    .setDescription("Send a message to mods.")
    .setContexts([InteractionContextType.Guild]);