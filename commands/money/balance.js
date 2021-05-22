exports.run = (client, message, args) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { bank } = require('../../database/bank');
        let target = message.mentions.users.first();

        if (!target) {
            let userID = args[0];
            target = client.users.cache.get(userID);
        };

        if (!target) {
            target = message.author;
        };

        return sendMessage(client, message, `${target.tag} has ${Math.floor(bank.currency.getBalance(target.id))}${globalVars.currency}.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "balance",
    aliases: ["bal", "money"],
    description: "Sends how much money you have."
};