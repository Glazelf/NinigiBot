exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        if (message.member.id !== client.config.ownerID) return sendMessage({ client: client, message: message, content: globalVars.lackPerms });

        if (!args[1]) return sendMessage({ client: client, message: message, content: `You need to provide a message to send.` });

        // Split off command
        let textMessage = args.slice(1).join(" ");
        const userID = args[0];

        let targetUser;
        try {
            targetUser = await client.users.fetch(userID);
        } catch (e) {
            // console.log(e);
        };

        if (!targetUser) return sendMessage({ client: client, message: message, content: `I could not find that ID, it's likely I don't share a server with them or they don't exist.` });

        try {
            await targetUser.send({ content: textMessage });
            return sendMessage({ client: client, message: message, content: `Message succesfully sent to **${targetUser.tag}** (${targetUser.id}).` });
        } catch (e) {
            // console.log(e);
            return sendMessage({ client: client, message: message, content: `Failed to message **${targetUser.tag}**. They probably have their DMs closed.` });
        };

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "dm",
    aliases: [],
    description: "DMs a user.",
    permission: "owner",
    defaultPermission: false,
    options: [{
        name: "user-id",
        type: 3,
        description: "Specify user by ID.",
        required: true
    }, {
        name: "input",
        type: 3,
        description: "Text message to DM.",
        required: true
    }]
};
