exports.run = async (client, message, args) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(message.member, client);
        if (!adminBool) return sendMessage(client, message, globalVars.lackPerms);

        return sendMessage(client, message, `Rules time.`);

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "rule",
    aliases: ["rules", "faq"],
    description: "Edit or display rules of this server."
};