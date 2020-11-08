module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (message.author.id !== client.config.ownerID) return message.reply(globalVars.lackPerms);

        const { bank } = require('../../database/bank');
        const input = message.content.slice(1).trim();
        const [, , commandArgs] = input.match(/(\w+)\s*([\s\S]*)/);
        let currency = globalVars.currency;

        const transferAmount = commandArgs.split(/ +/).find(arg => !/<@!?\d+>/.test(arg));
        let transferTarget = message.mentions.users.first();

        let userBalance = `${Math.floor(bank.currency.getBalance(message.author.id))}${currency}`;

        if (!transferTarget) {
            const input = message.content.split(` `, 3);
            let userID = input[1];
            transferTarget = client.users.cache.get(userID);
        };

        if (!transferTarget) {
            transferTarget = message.author;
        };

        if (!transferAmount || isNaN(transferAmount)) return message.channel.send(`> That's not a valid number, ${message.author}.`);

        bank.currency.add(transferTarget.id, +transferAmount).then(userBalance = `${Math.floor(bank.currency.getBalance(message.author.id))}${currency}`);

        return message.channel.send(`> Successfully added ${transferAmount}${currency} to ${transferTarget.tag}.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "moneyadd",
    aliases: ["addmoney"]
};