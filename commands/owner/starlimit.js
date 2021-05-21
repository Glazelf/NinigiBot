exports.run = (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        if (message.author.id !== client.config.ownerID) return sendMessage(client, message, globalVars.lackPerms);

        const input = message.content.split(` `, 2);
        let starLimit = input[1];

        if (isNaN(starLimit)) return sendMessage(client, message, `You need to provide a valid number.`);

        if (starLimit === globalVars.starboardLimit) return sendMessage(client, message, `The starboard star limit didn't change since it's equal to the number you provided, ${starLimit}.`);

        globalVars.starboardLimit = starLimit;

        return sendMessage(client, message, `The starboard star limit was changed to ${starLimit}.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "starlimit",
    aliases: ["sl"],
    description: "Change the star amount to appear on starboard.",
    options: [{
        name: "amount",
        type: "INTEGER",
        description: "Amount of stars required."
    }]
};