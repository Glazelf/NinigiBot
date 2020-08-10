module.exports.run = async (client, message) => {
    try {
        // Import globals
        let globalVars = require('../events/ready');

        if (message.author.id !== globalVars.ownerID) {
            return message.channel.send(globalVars.lackPerms)
        };
        const { bank } = require('../bank');
        const input = message.content.slice(1).trim();
        const [, , commandArgs] = input.match(/(\w+)\s*([\s\S]*)/);
        const currentAmount = bank.currency.getBalance(message.author.id);
        const transferAmount = commandArgs.split(/ +/).find(arg => !/<@!?\d+>/.test(arg));
        const transferTarget = message.mentions.users.first();
        let userBalance = `${Math.floor(bank.currency.getBalance(message.author.id))}💰`;

        if (!transferAmount || isNaN(transferAmount)) return message.channel.send(`> That's not a valid number, ${message.author}.`);
        parseFloat(transferAmount);

        bank.currency.add(transferTarget.id, transferAmount);

        return message.channel.send(`> Successfully added ${transferAmount}💰 to ${transferTarget.tag}.`)

    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
    };
};
