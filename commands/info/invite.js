exports.run = async (client, message) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        return sendMessage(client, message, `Here's an invite for me to join your server: <https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=8>.`);

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "invite",
    aliases: [],
    description: `Sends an invite to add this bot to your server.`
};