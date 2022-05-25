exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");

        let ephemeral = false;

        let message = await interaction.channel.messages.fetch(interaction.targetId);
        let input = message.content;
        let questionAskUser = message.author;

        // Swap interaction and message if command is used through apps menu, makes the interaction finish properly by replying to the interaction instead of the message.
        if (interaction) message = interaction;

        if (input.length < 1) return sendMessage({ client: client, interaction: interaction, content: `Make sure you provided input either by typing it out as an argument or replying to a message that has text in it.` });

        let question = input.normalize("NFD");
        let googleLink = `https://www.google.com/search?q=${encodeURIComponent(question)}`;

        let maxLinkLength = 512;
        if (googleLink.length > maxLinkLength) googleLink = googleLink.substring(0, maxLinkLength);

        // Button
        let googleButton = new Discord.MessageActionRow()
            .addComponents(new Discord.MessageButton({ label: 'Google', style: 'LINK', url: googleLink }));

        let returnString = `Here's the answer to your question, ${questionAskUser}:`;

        return sendMessage({ client: client, interaction: interaction, content: returnString, components: googleButton, ephemeral: ephemeral });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "Google",
    type: "MESSAGE"
};