exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const { bank } = require('../../database/bank');
        const input = message.content.slice(1).trim();
        const [, , commandArgs] = input.match(/(\w+)\s*([\s\S]*)/);
        const currentAmount = bank.currency.getBalance(message.author.id);
        const transferAmount = commandArgs.split(/ +/).find(arg => !/<@!?\d+>/.test(arg));
        const transferTarget = message.mentions.users.first();
        if (!transferTarget) {
            const input = message.content.split(` `, 3);
            let userID = input[1];
            transferTarget = client.users.cache.get(userID);
        };
        if(!transferTarget) return;
        let userBalance = `${Math.floor(bank.currency.getBalance(message.author.id))}💰`;

        if (transferTarget == message.author) return message.channel.send(`> You can't transfer money to yourself, ${message.author}.`)
        if (!transferAmount || isNaN(transferAmount)) return message.channel.send(`> You need to specify a valid number to transfer, ${message.author}.`);
        if (transferAmount > currentAmount) return message.channel.send(`> You don't have enough money to transfer that much, you only have ${userBalance}.`);
        if (transferAmount <= 0) return message.channel.send(`> Please enter an amount greater than zero, ${message.author}.`);

        bank.currency.add(message.author.id, -transferAmount);
        bank.currency.add(transferTarget.id, transferAmount);

        return message.channel.send(`> Successfully transferred ${transferAmount}💰 to ${transferTarget.tag}, ${message.author}.`);

    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${globalVars.prefix}info.`);
    };
};
