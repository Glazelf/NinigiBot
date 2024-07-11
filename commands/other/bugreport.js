import {
    ModalBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle,
    SlashCommandBuilder
} from "discord.js";

const modal = new ModalBuilder()
    .setCustomId('bugReportModal')
    .setTitle('Bug Report');
const titleInput = new TextInputBuilder()
    .setCustomId('bugReportTitle')
    .setLabel("Title your bug report!")
    .setPlaceholder("I saw a weird bug :(")
    .setStyle(TextInputStyle.Short)
    .setMinLength(5)
    .setMaxLength(256)
    .setRequired(true);
const descriptionInput = new TextInputBuilder()
    .setCustomId('bugReportDescription')
    .setLabel("Describe what went wrong.")
    .setPlaceholder("I saw a spider with 10 legs, I don't think that's normal!")
    .setStyle(TextInputStyle.Paragraph)
    .setMinLength(10)
    .setMaxLength(1024)
    .setRequired(true);
const reproduceInput = new TextInputBuilder()
    .setCustomId('bugReportReproduce')
    .setLabel("How to reproduce this bug?")
    .setPlaceholder("Go left at the third tree, you should see cobwebs.")
    .setStyle(TextInputStyle.Paragraph)
    .setMinLength(10)
    .setMaxLength(1024)
    .setRequired(true);
const behaviourInput = new TextInputBuilder()
    .setCustomId('bugReportBehaviour')
    .setLabel("What behaviour did you expect?")
    .setPlaceholder("Spiders should have 8 legs.")
    .setStyle(TextInputStyle.Paragraph)
    .setMinLength(10)
    .setMaxLength(1024)
    .setRequired(true);
const contextInput = new TextInputBuilder()
    .setCustomId('bugReportContext')
    .setLabel("What platform are you using? Beta?")
    .setPlaceholder("Android (Canary)")
    .setStyle(TextInputStyle.Short)
    .setMinLength(1)
    .setMaxLength(100)
    .setRequired(true);
const actionRow1 = new ActionRowBuilder()
    .addComponents(titleInput);
const actionRow2 = new ActionRowBuilder()
    .addComponents(descriptionInput);
const actionRow3 = new ActionRowBuilder()
    .addComponents(reproduceInput);
const actionRow4 = new ActionRowBuilder()
    .addComponents(behaviourInput);
const actionRow5 = new ActionRowBuilder()
    .addComponents(contextInput);
modal.addComponents(actionRow1, actionRow2, actionRow3, actionRow4, actionRow5);

export default async (interaction) => {
    return interaction.showModal(modal);
};

// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("bugreport")
    .setDescription("Report a bug to the bot owners.");