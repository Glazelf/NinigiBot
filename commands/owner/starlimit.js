exports.run = (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (message.author.id !== client.config.ownerID) return message.reply(globalVars.lackPerms);

        const input = message.content.split(` `, 2);
        let starLimit = input[1];

        if (isNaN(starLimit)) return message.reply(`You need to provide a valid number.`);

        if (starLimit === globalVars.starboardLimit) return message.reply(`The starboard star limit didn't change since it's equal to the number you provided, ${starLimit}.`);

        globalVars.starboardLimit = starLimit;

        return message.reply(`The starboard star limit was changed to ${starLimit}.`);

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