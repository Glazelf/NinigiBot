const Discord = require("discord.js");
exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const randomNumber = require('../../util/randomNumber');

        const { bank } = require('../../database/bank');
        let currency = globalVars.currency;
        let balance = await bank.currency.getBalance(message.member.id);
        let inputText = "";
        if (args[0]) inputText = args[0].toString().toLowerCase();

        // Heads / Tails + Amounts
        let winSide = "heads";
        let loseSide = "tails";
        let amount = args[0];
        if (inputText == "tails" || args[1] == "tails") {
            winSide = "tails";
            loseSide = "heads";
        };
        if (!isNaN(args[1]) || ["quarter", "half", "all", "random"].includes(args[1])) amount = args[1];

        // Shortcuts
        if (amount == "quarter") amount = balance / 4;
        if (amount == "half") amount = balance / 2;
        if (amount == "all") amount = balance;
        if (amount == "random") amount = randomNumber(1, balance);
        if (!amount || isNaN(amount) || amount <= 0) return sendMessage({ client: client, message: message, content: `Please input a valid number.` });

        // Enforce flooring
        amount = Math.floor(amount);
        balance = Math.floor(balance);

        if (amount <= 0) return sendMessage({ client: client, message: message, content: `Please make sure the amount you entered is equal to or larger than 1.` });

        if (amount > balance) return sendMessage({ client: client, message: message, content: `You only have ${Math.floor(balance)}${currency}.` });

        let returnString = `Congratulations, you flipped **${winSide}** and won ${amount}${currency}. You now have ${balance + amount}${currency}.`;

        // Coinflip randomization, code in brackets is executed only upon a loss
        if (Math.random() >= 0.5) {
            returnString = `Sorry, you flipped **${loseSide}** and lost ${amount}${currency}. You now have ${balance - amount}${currency}.`;
            amount = Math.abs(amount) * -1;
        };

        bank.currency.add(message.member.id, amount);
        sendMessage({ client: client, message: message, content: returnString });

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "coinflip",
    aliases: ["cf", "flip"],
    description: "Bet money on a coinflip.",
    options: [{
        name: "bet-amount",
        type: Discord.ApplicationCommandOptionType.Integer,
        description: "The amount of money you want to bet.",
        required: true
    }]
};