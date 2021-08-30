exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const getLanguageString = require('../../util/getLanguageString');
        if (message.member.id !== client.config.ownerID) return sendMessage(client, message, globalVars.lackPerms);

        // send channel a message that you're resetting bot [optional]
        await sendMessage(client, message, `Restarting...`);
        await client.destroy();
        await client.login(client.config.token);
        return sendMessage(client, message, `Successfully restarted!`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "restart",
    aliases: [],
    description: "Restart bot and reload all files."
};