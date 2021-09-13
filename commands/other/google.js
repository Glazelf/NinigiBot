exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");

        let replyMessage;

        // Slash Command
        if (message.type == "APPLICATION_COMMAND") {
            replyMessage = await message.channel.messages.fetch(args[0]);

            // Regular Command
        } else {
            if (!message.reference) return sendMessage(client, message, `Please reply to the message that contains a stupid question.`);
            replyMessage = await message.channel.messages.fetch(message.reference.messageId);
        };

        if (!replyMessage) return sendMessage(client, message, `No message could be found for that ID.`);
        if (!replyMessage.content) return sendMessage(client, message, `That message has no text content to Google.`);

        let input = replyMessage.content;
        let question = input.replaceAll(" ", "+");
        let googleLink = `https://www.google.com/search?q=${question}`;

        // Button
        let googleButton = new Discord.MessageActionRow()
            .addComponents(new Discord.MessageButton({ label: 'Google', style: 'LINK', url: googleLink }));

        let returnString = `Here's the answer to your question, ${replyMessage.author}:`;

        return sendMessage(client, message, returnString, null, null, false, googleButton);

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "google",
    aliases: ["lmgtfy"],
    description: "Generates a Google link for a stupid question.",
    options: [{
        name: "Message ID",
        type: "STRING",
        description: "Message ID of the question that should've been Googled.",
    }]
};