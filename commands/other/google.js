import {
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";

export default async (interaction, ephemeral) => {
    try {
        ephemeral = false;
        let message = await interaction.channel.messages.fetch(interaction.targetId);
        let input = message.content;
        let questionAskUser = message.author;
        // Swap interaction and message if command is used through apps menu, makes the interaction finish properly by replying to the interaction instead of the message.
        if (interaction) message = interaction;

        if (input.length < 1) return sendMessage({ interaction: interaction, content: `Make sure you provided input either by typing it out as an argument or replying to a message that has text in it.` });

        let question = input.normalize("NFD");
        let googleLink = `https://www.google.com/search?q=${encodeURIComponent(question)}`;

        let maxLinkLength = 512;
        if (googleLink.length > maxLinkLength) googleLink = googleLink.substring(0, maxLinkLength);
        // Button
        const googleButton = new ButtonBuilder()
            .setLabel("Google")
            .setStyle(ButtonStyle.Link)
            .setURL(googleLink);
        let googleActionRow = new ActionRowBuilder()
            .addComponents(googleButton);

        let returnString = `Here's the answer to your question, ${questionAskUser}:`;

        return sendMessage({ interaction: interaction, content: returnString, components: googleActionRow, ephemeral: ephemeral });

    } catch (e) {
        logger({ exception: e, interaction: interaction });
    };
};

export const commandObject = new ContextMenuCommandBuilder()
    .setName("Google")
    .setType(ApplicationCommandType.Message);