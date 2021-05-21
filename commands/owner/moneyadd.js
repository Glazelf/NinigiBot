module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        if (message.author.id !== client.config.ownerID) return sendMessage(client, message, globalVars.lackPerms);

        const { bank } = require('../../database/bank');
        const input = message.content.slice(1).trim();
        const [, , commandArgs] = input.match(/(\w+)\s*([\s\S]*)/);
        let currency = globalVars.currency;

        const transferAmount = commandArgs.split(/ +/).find(arg => !/<@!?\d+>/.test(arg));
        let transferTarget = message.mentions.users.first();

        let userBalance = `${Math.floor(bank.currency.getBalance(message.author.id))}${currency}`;

        if (!transferTarget) {
            const input = message.content.split(` `, 3);
            let userID = input[2];
            transferTarget = client.users.cache.get(userID);
        };

        if (!transferTarget) return sendMessage(client, message, `That's not a valid target.`);
        if (!transferAmount || isNaN(transferAmount)) return sendMessage(client, message, `That's not a valid number.`);

        bank.currency.add(transferTarget.id, +transferAmount).then(userBalance = `${Math.floor(bank.currency.getBalance(message.author.id))}${currency}`);

        return sendMessage(client, message, `Successfully added ${transferAmount}${currency} to ${transferTarget.tag}.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "moneyadd",
    aliases: ["addmoney"],
    description: "Add money to a user.",
    options: [{
        name: "amount",
        type: "INTEGER",
        description: "Amount of money to add.",
        required: true
    }, {
        name: "user-mention",
        type: "MENTIONABLE",
        description: "Specify user by mention."
    }, {
        name: "user-id",
        type: "STRING",
        description: "Specify user by ID."
    }]
};