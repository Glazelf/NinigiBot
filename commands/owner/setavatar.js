exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        if (message.member.id !== client.config.ownerID) return sendMessage({ client: client, message: message, content: globalVars.lackPerms });

        if (message.attachments.size < 1) return sendMessage({ client: client, message: message, content: `Please supply an image.` });

        const [firstAttachment] = message.attachments.values();
        await client.user.setAvatar(firstAttachment.url);

        return sendMessage({ client: client, message: message, content: `Successfully updated my avatar.` });

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "setavatar",
    aliases: [],
    description: "Set Ninigi's avatar.",
    serverID: "759344085420605471"
};