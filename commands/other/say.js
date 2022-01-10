exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');

        // Split off command
        if (!args[0]) return sendMessage(client, message, `Please provide text to say.`);
        let channelID = args[0];
        let textMessage = args.join(" ");
        let remoteMessage = textMessage.slice(channelID.length + 1);

        // Catch empty argument
        if (textMessage.length < 1) {
            return sendMessage(client, message, `You need to specify text for me to say.`);
        };

        // Owner only function to send messages in different channels
        if (message.member.id == client.config.ownerID) {
            try {
                // If channelID is specified correctly, throw message into specified channel
                targetChannel = await message.client.channels.fetch(channelID);
                targetChannel.send({ content: remoteMessage });
                return sendMessage(client, message, `Message succesfully sent to specified channel.`);
            } catch (e) {
                // If error: execute regular quoteless say
                return message.channel.send({ content: textMessage });
            };
        } else if (adminBool) {
            // Return plain message if member is admin
            return message.channel.send({ content: textMessage });
        } else {
            // Add credits to avoid anonymous abuse by people who are admin nor owner
            textMessage = `"\`${textMessage}\`"\n-${message.member}`;
            return sendMessage(client, message, textMessage);
        };

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "say",
    aliases: [],
    description: "Makes the bot repeat text.",
    options: [{
        name: "input",
        type: "STRING",
        description: "Text to make the bot say."
    }]
};