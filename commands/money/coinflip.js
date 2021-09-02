const cooldown = new Set();

exports.run = (client, message, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const getLanguageString = require('../../util/getLanguageString');
        if (cooldown.has(message.member.id)) return sendMessage(client, message, `You are currently on cooldown from using this command.`);

        const { bank } = require('../../database/bank');
        let currency = globalVars.currency;
        let balance = bank.currency.getBalance(message.member.id);
        let inputText = "";
        if (args[0]) inputText = args[0].toString().toLowerCase();

        // Heads / Tails + Amounts
        let winSide = "heads";
        let loseSide = "tails";
        amount = args[0];
        if (inputText == "tails" || args[1] == "tails") {
            winSide = "tails";
            loseSide = "heads";
        };
        if (!isNaN(args[1]) || ["quarter", "half", "all"].includes(args[1])) amount = args[1];

        // Shortcuts
        if (amount == "quarter") amount = balance / 4;
        if (amount == "half") amount = balance / 2;
        if (amount == "all") amount = balance;
        if (!amount || isNaN(amount) || amount <= 0) return sendMessage(client, message, `Please enter an a number that's equal to or larger than 1.`);

        amount = Math.floor(amount);

        if (amount > balance) {
            return sendMessage(client, message, `You only have ${Math.floor(balance)}${currency}.`);
        };

        let returnString = `Congratulations, you flipped **${winSide}** and won ${amount}${currency}.`;

        // Coinflip randomization, code in brackets is executed only upon a loss
        if (Math.random() >= 0.5) {
            returnString = `Sorry, you flipped **${loseSide}** and lost ${amount}${currency}.`;
            amount = Math.abs(amount) * -1;
        };

        bank.currency.add(message.member.id, amount);
        sendMessage(client, message, returnString);

        cooldown.add(message.member.id);

        return setTimeout(() => {
            cooldown.delete(message.member.id);
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