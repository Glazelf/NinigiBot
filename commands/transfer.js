exports.run = async (client, message) => {
    try {
        const { bank } = require('../bank');
        const input = message.content.slice(1).trim();
        const [, , commandArgs] = input.match(/(\w+)\s*([\s\S]*)/);
        const currentAmount = bank.currency.getBalance(message.author.id);
        const transferAmount = commandArgs.split(/ +/).find(arg => !/<@!?\d+>/.test(arg));
        const transferTarget = message.mentions.users.first();
        let userBalance = `${Math.floor(bank.currency.getBalance(message.author.id))}💰`;

        if (transferTarget == message.author) return message.channel.send(`> You can't transfer money to yourself, ${message.author}.`)
        if (!transferAmount || isNaN(transferAmount)) return message.channel.send(`> That's not a valid number, ${message.author}.`);
        if (transferAmount > currentAmount) return message.channel.send(`> You don't have enough money to transfer that much, you only have ${userBalance}.`);
        if (transferAmount <= 0) return message.channel.send(`> Please enter an amount greater than zero, ${message.author}`);

        bank.currency.add(message.author.id, -transferAmount);
        bank.currency.add(transferTarget.id, transferAmount);

        return message.channel.send(`> Successfully transferred ${transferAmount}💰 to ${transferTarget.tag}. Your new balance is ${userBalance}.`);

    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
    };
};
