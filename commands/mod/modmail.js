import {
    MessageFlags,
    InteractionContextType,
    GuildFeature,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    SlashCommandBuilder,
    LabelBuilder,
    FileUploadBuilder
} from "discord.js";
import sendMessage from "../../util/discord/sendMessage.js";

const modal = new ModalBuilder()
    .setCustomId('modMailModal')
    .setTitle('Mod Mail 💌');
const titleInput = new TextInputBuilder()
    .setCustomId('modMailTitle')
    .setPlaceholder("Someone is harassing me.")
    .setStyle(TextInputStyle.Short)
    .setMinLength(5)
    .setMaxLength(256)
    .setRequired(true);
const descriptionInput = new TextInputBuilder()
    .setCustomId('modMailDescription')
    .setPlaceholder("User BigYoshi28 (748199267725869127) is calling me a stinky nerd!")
    .setStyle(TextInputStyle.Paragraph)
    .setMinLength(10)
    .setMaxLength(1024)
    .setRequired(true);
const fileInput = new FileUploadBuilder()
    .setCustomId("modMailFile")
    .setMinValues(1)
    .setMaxValues(4) // Limited to 4 to not overload attachments field later. Also good visibility
    .setRequired(false); // This is true by default
const titleLabel = new LabelBuilder()
    .setLabel("Title your mail!")
    .setTextInputComponent(titleInput);
const descriptionLabel = new LabelBuilder()
    .setLabel("Elaborate on your problem.")
    .setTextInputComponent(descriptionInput);
const fileLabel = new LabelBuilder()
    .setLabel("Upload a screenshot.")
    .setFileUploadComponent(fileInput);
modal.addLabelComponents(titleLabel, descriptionLabel, fileLabel);

const noCommunityString = "This server has Community features disabled.\nThese are required for this command to work properly.\nModmail will be sent to the same channel as community updates.";

export default async (interaction, messageFlags) => {
    if (!interaction.guild.features.includes(GuildFeature.Community) || !interaction.guild.safetyAlertsChannel) return sendMessage({ interaction: interaction, content: noCommunityString, flags: messageFlags.add(MessageFlags.Ephemeral) });
    return interaction.showModal(modal);
};

// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("modmail")
    .setDescription("Send a message to mods.")
    .setContexts([InteractionContextType.Guild]);