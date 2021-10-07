exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        if (message.member.id !== client.config.ownerID) return sendMessage(client, message, globalVars.lackPerms);

        if (!args[1]) return sendMessage(client, message, `You need to provide a message to send.`);

        // Split off command
        let textMessage = args.slice(1).join(" ");
        const userID = args[0];

        let targetUser;
        try {
            targetUser = await client.users.fetch(userID);
        } catch (e) {
            // console.log(e);
        };

        if (!targetUser) {
            return sendMessage(client, message, `I could not find that ID, it's likely I don't share a server with them or they don't exist.`);
        };

        await targetUser.send({ content: textMessage });
        return sendMessage(client, message, `Message succesfully sent to **${targetUser.tag}** (${targetUser.id}).`);

    } catch (e) {
        // Log error
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
