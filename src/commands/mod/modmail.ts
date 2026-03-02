import {
    MessageFlags,
    InteractionContextType,
    GuildFeature,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    SlashCommandBuilder,
    LabelBuilder,
    FileUploadBuilder,
    UserSelectMenuBuilder
} from "discord.js";
import sendMessage from "../../util/discord/sendMessage.js";

const modal = new ModalBuilder()
    .setCustomId('modMailModal')
    .setTitle('Mod Mail 💌');
const titleInput = new TextInputBuilder()
    .setCustomId('modMailTitle')
    .setPlaceholder("Someone is harassing me.")
    .setStyle(TextInputStyle.Short)
    .setMinLength(3)
    .setMaxLength(50)
    .setRequired(true);
const descriptionInput = new TextInputBuilder()
    .setCustomId('modMailDescription')
    .setPlaceholder("BigYoshi28 is calling me a stinky nerd!")
    .setStyle(TextInputStyle.Paragraph)
    .setMinLength(10)
    .setMaxLength(1000)
    .setRequired(true);
const userInput = new UserSelectMenuBuilder()
    .setCustomId("modMailUsers")
    .setMinValues(1)
    .setMaxValues(5)
    .setRequired(false);
const fileInput = new FileUploadBuilder()
    .setCustomId("modMailFile")
    .setMinValues(1)
    .setMaxValues(4) // Limited to 4 to not overload attachments field later. Also good visibility for mods
    .setRequired(false);
const titleLabel = new LabelBuilder()
    .setLabel("Title your mail.")
    .setTextInputComponent(titleInput);
const descriptionLabel = new LabelBuilder()
    .setLabel("Elaborate on your problem.")
    .setDescription("Go into detail. The moderators will contact you if they need more information.")
    .setTextInputComponent(descriptionInput);
const userLabel = new LabelBuilder()
    .setLabel("Does this concern a specific user or users?")
    .setDescription("This can help moderators find the specific user you're talking about.")
    .setUserSelectMenuComponent(userInput);
const fileLabel = new LabelBuilder()
    .setLabel("Upload screenshots or other files.")
    .setDescription("Only upload relevant files, abuse of modmail can be punished.")
    .setFileUploadComponent(fileInput);
modal.addLabelComponents(titleLabel, descriptionLabel, userLabel, fileLabel);

const noCommunityString = "This server has Community features disabled.\nThese are required for this command to work properly.\nModmail will be sent to the same channel as community updates.";

export default async (interaction: any, messageFlags: any) => {
    if (!interaction.guild.features.includes(GuildFeature.Community) || !interaction.guild.safetyAlertsChannel) return sendMessage({ interaction: interaction, content: noCommunityString, flags: messageFlags.add(MessageFlags.Ephemeral) });
    return interaction.showModal(modal);
};

// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("modmail")
    .setDescription("Send a message to mods.")
    .setContexts([InteractionContextType.Guild]);