exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const { bank } = require('../../database/bank');
        const input = message.content.split(` `, 3);
        const currentAmount = bank.currency.getBalance(message.author.id);
        let transferAmount = input[1];
        let transferTarget = message.mentions.users.first();
        if (!transferTarget) {
            let userID = input[2];
            transferTarget = client.users.cache.get(userID);
        };
        if (!transferTarget) return;
        let userBalance = `${Math.floor(bank.currency.getBalance(message.author.id))}${globalVars.currency}`;

        if (transferTarget == message.author) return message.channel.send(`> You can't transfer money to yourself, ${message.author}.`)
        if (!transferAmount || isNaN(transferAmount)) return message.channel.send(`> You need to specify a valid number to transfer, ${message.author}.`);
        if (transferAmount > currentAmount) return message.channel.send(`> You don't have enough money to transfer that much, you only have ${userBalance}.`);
        if (transferAmount <= 0) return message.channel.send(`> Please enter an amount greater than zero, ${message.author}.`);

        bank.currency.add(message.author.id, -transferAmount);
        bank.currency.add(transferTarget.id, transferAmount);

        return message.channel.send(`> Successfully transferred ${transferAmount}${globalVars.currency} to ${transferTarget.tag}, ${message.author}.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports = {
    name: "transfer",
    aliases: ["give"]
};
