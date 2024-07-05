import {
    EmbedBuilder,
    SlashCommandBuilder
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import logger from "../../util/logger.js";
import randomNumber from "../../util/randomNumber.js";
import quotes from "../../objects/quotes.json" with { type: "json" };
import globalVars from "../../objects/globalVars.json" with { type: "json" };

let previousQuoteTime = null;
let allMessages = [];
for (const [key, value] of Object.entries(quotes)) {
    value.forEach(messageID => allMessages.push({ channelID: key, messageID: messageID }));
};

export default async (interaction, ephemeral) => {
    try {
        ephemeral = false;
        let quoteEmbed = new EmbedBuilder()
            .setColor(globalVars.embedColor);
        const now = Date.now();
        const cooldownAmount = 6 * 60 * 60 * 1000; // 6 hours in ms

        if (previousQuoteTime) {
            const expirationTime = previousQuoteTime + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = Math.floor((expirationTime - now) / 1000 / 60); // time left in min
                return sendMessage({ interaction: interaction, content: `Please wait ${timeLeft} more minutes before trying to achieve even more wisdom.` });
            };
        };
        let randomMessage = allMessages[randomNumber(0, allMessages.length - 1)];
        let messageURL = `https://discord.com/channels/${globalVars.ShinxServerID}/${randomMessage.channelID}/${randomMessage.messageID}`;
        let channel, message;
        try {
            channel = await interaction.guild.channels.fetch(randomMessage.channelID);
            message = await channel.messages.fetch(randomMessage.messageID);
        } catch (e) {
            console.log(e);
            quoteEmbed
                .setTitle("Error")
                .setURL(messageURL)
                .setColor(globalVars.embedColorError)
                .setDescription(`Failed to fetch the selected message.\nChannel ID: ${randomMessage.channelID}\nMessage ID: ${randomMessage.messageID}`);
            return sendMessage({ interaction: interaction, embeds: quoteEmbed, ephemeral: ephemeral });
        };

        let messageImage = null;
        if (message.attachments.size > 0) messageImage = message.attachments.first().url;
        if (message.member) console.log(message.member)
        let avatar = message.author.displayAvatarURL(globalVars.displayAvatarSettings);
        if (message.member) avatar = message.member.displayAvatarURL(globalVars.displayAvatarSettings);

        quoteEmbed
            .setAuthor({ name: "Quote" })
            .setTitle(message.author.username)
            .setURL(messageURL)
            .setThumbnail(avatar)
            .setDescription(message.content)
            .setImage(messageImage)
            .setFooter(`Channel: ${channel.id} | Message: ${message.id}`);
        previousQuoteTime = now;
        return sendMessage({ interaction: interaction, embeds: quoteEmbed, ephemeral: ephemeral });

    } catch (e) {
        logger({ exception: e, interaction: interaction });
    };
};

export const guildID = globalVars.ShinxServerID;

export const commandObject = new SlashCommandBuilder()
    .setName("quote")
    .setDescription("Let someone's wisdom guide you.")
    .setDMPermission(false);