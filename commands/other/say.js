exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const { Prefixes } = require('../../database/dbObjects');
        const isAdmin = require('../../util/isAdmin');

        let prefix = await Prefixes.findOne({ where: { server_id: message.guild.id } });
        if (prefix) {
            prefix = prefix.prefix;
        } else {
            prefix = globalVars.prefix;
        };

        // Split off command
        let input = message.content.slice(1).trim();
        let [, , textMessage] = input.match(/(\w+)\s*([\s\S]*)/);
        let split = textMessage.split(` `, 1);
        let channelID = split[0];
        let remoteMessage = textMessage.slice(channelID.length + 1);

        // Catch empty argument
        if (textMessage.length < 1) {
            return message.reply(`You need to specify text for me to say.`);
        };

        // Owner only function to send messages in different channels
        if (message.author.id == client.config.ownerID) {
            try {
                // If channelID is specified correctly, throw message into specified channel
                targetChannel = message.client.channels.cache.get(channelID)
                targetChannel.send(remoteMessage);
                return message.reply(`Message succesfully sent to specified channel.`);
            } catch (e) {
                // If error: execute regular quoteless say
                return message.reply(textMessage);
            };
        } else if (isAdmin(message.member, client)) {
            // Return plain message if member is admin
            return message.reply(textMessage);
        } else {
            // Prevent using bot to go around ping permissions
            if (textMessage.includes("@")) {
                return message.reply(`You need to have Administrator permissions to tag people using \`${prefix}say\`.`)
            };

            // Add credits to avoid anonymous abuse by people who are admin nor owner
            textMessage = `"\`${textMessage}\`"
    > -${message.author}`;
            return message.reply(textMessage);
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

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