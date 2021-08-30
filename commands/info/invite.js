exports.run = async (client, message) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const getLanguageString = require('../../util/getLanguageString');
        return sendMessage(client, message, `Here's an invite for me to join your server: <https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=8>.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "invite",
    aliases: [],
    description: `Sends an invite to add this bot to your server.`
};