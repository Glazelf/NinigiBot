exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");

        let replyMessage;
        let input;
        let questionAskUser;
        let interaction = null;

        // Reply
        if (message.reference) {
            if (message.reference) replyMessage = await message.channel.messages.fetch(message.reference.messageId);
            input = replyMessage.content;
            questionAskUser = replyMessage.author;

            // Text in command
        } else {
            if (message.type == "APPLICATION_COMMAND") {
                interaction = message;
                message = await message.channel.messages.fetch(args[0]);
                input = message.content;
                questionAskUser = message.member;
            } else {
                questionAskUser = `**${message.author.tag}**`;
                input = args.join(" ");
            };
        };

        // Swap interaction and message if command is used through apps menu, makes the interaction finish properly by replying to the interaction instead of the message.
        if (interaction) message = interaction;

        if (input.length < 1) return sendMessage({ client: client, message: message, content: `Make sure you provided input either by typing it out as an argument or replying to a message that has text in it.` });

        let question = input.replaceAll("+", "%2B").replaceAll(" ", "+").normalize("NFD");
        let googleLink = `https://www.google.com/search?q=${question}`;

        let maxLinkLength = 512;
        if (googleLink.length > maxLinkLength) googleLink = googleLink.substring(0, maxLinkLength);

        // Button
        let googleButton = new Discord.MessageActionRow()
            .addComponents(new Discord.MessageButton({ label: 'Google', style: 'LINK', url: googleLink }));

        let returnString = `Here's the answer to your question, ${questionAskUser}:`;

        return sendMessage({ client: client, message: message, content: returnString, components: googleButton, ephemeral: false });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "Google",
    type: "MESSAGE"
};