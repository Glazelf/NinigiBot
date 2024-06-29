import {
    EmbedBuilder,
    SlashCommandBuilder
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import logger from "../../util/logger.js";
import randomNumber from "../../util/randomNumber.js";
import quotes from "../../objects/quotes.json" with { type: "json" };
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import config from "../../config.json" with { type: "json" };

let previousQuoteTime = null;

export default async (client, interaction, ephemeral) => {
    try {
        ephemeral = false;

        const now = Date.now();
        const cooldownAmount = 6 * 60 * 60 * 1000; // 6 hours in ms
        if (previousQuoteTime) {
            const expirationTime = previousQuoteTime + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = Math.floor((expirationTime - now) / 1000 / 60); // time left in min
                return sendMessage({ client: client, interaction: interaction, content: `Please wait ${timeLeft} more minutes before trying to achieve even more wisdom.` });
            };
        };
        // Get list of all message IDs for fairer random pick
        let allMessages = [];
        for await (const [key, value] of quotes) {
            value.forEach(messageID => allMessages.push({ channnelID: key, messageID: messageID }));
        };
        let randomMessage = allMessages[randomNumber[allMessages.length - 1]];
        let channel = interaction.guild.channels.fetch(randomMessage.channelID);
        let message = channel.messages.fetch(randomMessage.messageID);

        let messageImage = null;
        if (message.attachments.size > 0) messageImage = message.attachments.first().url;

        let quoteEmbed = new EmbedBuilder()
            .setColor(globalVars.embedColor)
            .setAuthor({ name: "Quote" })
            .setTitle(message.author.username)
            .setDescription(message.content)
            .setImage(messageImage);

        previousQuoteTime = now;
        return sendMessage({ client: client, interaction: interaction, embeds: quoteEmbed, ephemeral: ephemeral });

    } catch (e) {
        logger(e, client, interaction);
    };
};

export const guildIDs = [config.devServerID]; // Add Shinx server ID to this before release.

export const commandObject = new SlashCommandBuilder()
    .setName("quote")
    .setDescription("Let someone's wisdom guide you.")
    .setDMPermission(false);