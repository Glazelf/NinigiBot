exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        if (message.author.id !== client.config.ownerID) return sendMessage(client, message, globalVars.lackPerms);

        // Split off command
        let textMessage = message.content.slice(4);
        let split = textMessage.split(` `, 1);
        const userID = split[0];
        let remoteMessage = textMessage.slice(userID.length + 1);

        if (remoteMessage.length < 1) {
            return sendMessage(client, message, `You need to provide a message to send.`);
        };

        targetUser = client.users.cache.get(userID);
        if (!targetUser) {
            return sendMessage(client, message, `I could not find that ID, it's likely I don't share a server with them or they don't exist.`);
        };

        await targetUser.send(remoteMessage);
        return sendMessage(client, message, `Message succesfully sent to ${targetUser.tag}.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "dm",
    aliases: [],
    description: "DMs a user.",
    options: [{
        name: "user-id",
        type: "STRING",
        description: "Specify user by ID.",
        required: true
    }, {
        name: "input",
        type: "STRING",
        description: "Text message to DM.",
        required: true
    }]
};
