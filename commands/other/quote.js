import {
    InteractionContextType,
    EmbedBuilder,
    SlashCommandBuilder
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import randomNumber from "../../util/math/randomNumber.js";
import quotes from "../../objects/quotes.json" with { type: "json" };
import globalVars from "../../objects/globalVars.json" with { type: "json" };

// Avoid using channel ID for starboard (705601772785238080), link to channels directly instead.
let previousQuoteTime = null;
let allMessages = [];
for (const [key, value] of Object.entries(quotes)) {
    value.forEach(messageID => allMessages.push({ channelID: key, messageID: messageID }));
};

export default async (interaction, ephemeral) => {
    ephemeral = false;
    let quoteEmbed = new EmbedBuilder()
        .setColor(globalVars.embedColor);
    // Set cooldown
    const now = Date.now();
    const cooldownAmount = 1 * 60 * 60 * 1000; // 1 hour in ms
    if (previousQuoteTime) {
        const expirationTime = previousQuoteTime + cooldownAmount;
        if (now < expirationTime) {
            const timeLeft = Math.floor((expirationTime - now) / 1000 / 60); // time left in min
            return sendMessage({ interaction: interaction, content: `Please wait ${timeLeft} more minutes before trying to achieve even more wisdom.\nCooldown exists to make sure quotes stay fresh and don't repeat too often.`, ephemeral: true });
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
    let avatar = message.author.displayAvatarURL(globalVars.displayAvatarSettings);
    if (message.member) avatar = message.member.displayAvatarURL(globalVars.displayAvatarSettings);

    quoteEmbed
        .setAuthor({ name: message.author.username, iconURL: avatar })
        .setTitle("Quote")
        .setURL(messageURL)
        .setImage(messageImage)
        .setFooter({ text: `Message ID: ${message.id}` })
        .setTimestamp(message.createdTimestamp);
    if (message.content.length > 0) quoteEmbed.setDescription(message.content);
    previousQuoteTime = now;
    return sendMessage({ interaction: interaction, embeds: quoteEmbed, ephemeral: ephemeral });
};

export const guildID = globalVars.ShinxServerID;

export const commandObject = new SlashCommandBuilder()
    .setName("quote")
    .setDescription("Display a random SAC quote!")
    .setContexts([InteractionContextType.Guild]);