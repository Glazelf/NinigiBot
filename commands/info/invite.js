module.exports.run = async (client, message) => {
    try {
        return message.channel.send(`> Here's an invite for me to join your server, ${message.author}: <https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=8>`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "invite",
    aliases: ["inv"]
};