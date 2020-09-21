exports.run = (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const { bank } = require('../../database/bank');
        let target = message.mentions.users.first();

        if (!target) {
            const input = message.content.split(` `, 2);
            let userID = input[1];
            target = client.users.cache.get(userID);
        };

        if (!target) {
            target = message.author;
        };

        return message.channel.send(`> ${target.tag} has ${Math.floor(bank.currency.getBalance(target.id))}${globalVars.currency}.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports = {
    name: "balance",
    aliases: ["money"]
};