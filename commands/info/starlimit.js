exports.run = (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const input = message.content.split(` `, 2);
        let starLimit = input[1];

        if (!starLimit || isNaN(starLimit)) return message.channel.send(`> The current starboard star limit is ${globalVars.starboardLimit}, ${message.author}.`);

        if (message.author.id !== client.config.ownerID) {
            return message.channel.send(globalVars.lackPerms)
        };

        if (starLimit === globalVars.starboardLimit) return message.channel.send(`> The starboard star limit didn't change since it's equal to the number you provided, ${starLimit}, ${message.author}.`);

        globalVars.starboardLimit = starLimit;

        return message.channel.send(`> The starboard star limit was changed to ${starLimit}, ${message.author}.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};
