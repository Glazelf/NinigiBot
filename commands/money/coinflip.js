const cooldown = new Set();

exports.run = (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (cooldown.has(message.author.id)) return message.channel.send(`> You are currently on cooldown from using this command, ${message.author}.`);

        const { bank } = require('../../database/bank');
        let currency = globalVars.currency;
        let balance = bank.currency.getBalance(message.author.id);
        const input = message.content.split(` `);
        let inputText = "";
        if (input[1]) inputText = input[1].toLowerCase();

        // Heads / Tails + Amounts
        let winSide = "heads";
        let loseSide = "tails";
        amount = input[1];
        if (inputText == "tails" || input[2] == "tails") {
            winSide = "tails";
            loseSide = "heads";
        };
        if (!isNaN(input[2]) || ["quarter", "half", "all"].includes(input[2])) amount = input[2];

        // Shortcuts
        if (amount == "quarter") amount = balance / 4;
        if (amount == "half") amount = balance / 2;
        if (amount == "all") amount = balance;

        if (!amount || isNaN(amount)) return message.channel.send(`> You need to specify a valid number to gamble, ${message.author}.`);
        amount = Math.floor(amount);
        if (amount <= 0) return message.channel.send(`> Please enter an amount that's equal to or larger than 1, ${message.author}.`);

        if (amount > balance) {
            return message.channel.send(`> You only have ${Math.floor(balance)}${currency}, ${message.author}.`);
        };

        let returnString = `> Congratulations, ${message.author}, you flipped **${winSide}** and won ${amount}${currency}.`;

        // Coinflip randomization, code in brackets is executed only upon a loss
        if (Math.random() >= 0.5) {
            returnString = `> Sorry, ${message.author}, you flipped **${loseSide}** and lost ${amount}${currency}.`;
            amount = Math.abs(amount) * -1;
        };

        bank.currency.add(message.author.id, amount);
        message.channel.send(returnString);

        cooldown.add(message.author.id);

        return setTimeout(() => {
            cooldown.delete(message.author.id);
        }, 1500);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "coinflip",
    aliases: ["cf", "flip"]
};