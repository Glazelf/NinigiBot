exports.run = (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        // Split off command
        let textMessage = message.content.slice(5);
        let split = textMessage.split(` `, 1);
        const channelID = split[0];
        let remoteMessage = textMessage.slice(channelID.length + 1);

        // Catch empty argument
        if (textMessage.length < 1) {
            return message.channel.send(`> You need to specify text for me to say, ${message.author}.`);
        };

        // Owner only function to send messages in different channels
        if (message.author.id == client.config.ownerID) {
            try {
                // If channelID is specified correctly, throw message into specified channel
                targetChannel = message.client.channels.cache.get(channelID)
                targetChannel.send(remoteMessage);
                return message.channel.send(`Message succesfully sent to specified channel, ${message.author}.`);
            } catch (e) {
                // If error: execute regular quoteless say
                return message.channel.send(textMessage);
            };
        } else if (message.member.hasPermission("ADMINISTRATOR")) {
            // Return plain message if member is admin
            return message.channel.send(textMessage);
        } else {
            // Prevent using bot to go around ping permissions
            if (textMessage.includes("@")) { return message.channel.send(`> You need to have Administrator permissions to tag people using ${globalVars.prefix}say, ${message.author}.`) };

            // Add credits to avoid anonymous abuse by people who are admin nor owner
            textMessage = `> "${textMessage}"
    > -${message.author}`;
            return message.channel.send(textMessage);
        };

    } catch (e) {
        // log error
        let {logger} = require('../../events/ready');
        logger(e, message.channel);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command. The error has already been logged, but please also report this as an issue on the Github page or send a message to Glaze#6669. For links and other information use ${globalVars.prefix}info.`);
    };
};