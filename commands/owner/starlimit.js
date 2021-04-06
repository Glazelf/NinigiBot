exports.run = (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (message.author.id !== client.config.ownerID) return message.reply(globalVars.lackPerms);

        const input = message.content.split(` `, 2);
        let starLimit = input[1];

        if (isNaN(starLimit)) return message.channel.send(`> You need to provide a valid number, ${message.author}.`);

        if (starLimit === globalVars.starboardLimit) return message.channel.send(`> The starboard star limit didn't change since it's equal to the number you provided, ${starLimit}, ${message.author}.`);

        globalVars.starboardLimit = starLimit;

        return message.channel.send(`> The starboard star limit was changed to ${starLimit}, ${message.author}.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "starlimit",
    aliases: ["sl"]
};