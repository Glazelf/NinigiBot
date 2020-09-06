module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (message.author.id !== client.config.ownerID) {
            return message.reply(globalVars.lackPerms)
        };

        const { bank } = require('../../database/bank');
        const input = message.content.slice(1).trim();
        const [, , commandArgs] = input.match(/(\w+)\s*([\s\S]*)/);
        const currentAmount = bank.currency.getBalance(message.author.id);
        let currency = globalVars.currency;

        const transferAmount = commandArgs.split(/ +/).find(arg => !/<@!?\d+>/.test(arg));
        const transferTarget = message.mentions.users.first();

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
        let { logger } = require('../../events/ready');
        logger(e, message.channel);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${globalVars.prefix}info.`);
    };
};
