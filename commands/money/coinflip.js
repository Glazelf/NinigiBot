const cooldown = new Set();

exports.run = (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (cooldown.has(message.author.id)) return message.reply(`You are currently on cooldown from using this command.`);

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

        if (!amount || isNaN(amount)) return message.reply(`You need to specify a valid number to gamble.`);
        amount = Math.floor(amount);
        if (amount <= 0) return message.reply(`Please enter an amount that's equal to or larger than 1.`);

        if (amount > balance) {
            return message.reply(`You only have ${Math.floor(balance)}${currency}.`);
        };

        let returnString = `Congratulations, you flipped **${winSide}** and won ${amount}${currency}.`;

        // Coinflip randomization, code in brackets is executed only upon a loss
        if (Math.random() >= 0.5) {
            returnString = `Sorry, you flipped **${loseSide}** and lost ${amount}${currency}.`;
            amount = Math.abs(amount) * -1;
        };

        bank.currency.add(message.author.id, amount);
        message.reply(returnString);

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
    aliases: ["cf", "flip"],
    description: "Bet money on a coinflip.",
    options: [{
        name: "bet-amount",
        type: "INTEGER",
        description: "The amount of money you want to bet.",
        required: true
    }]
};