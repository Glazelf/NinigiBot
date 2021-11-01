const cooldown = new Set();

exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        if (cooldown.has(message.member.id)) return sendMessage(client, message, `You are currently on cooldown from using this command.`);

        const { bank } = require('../../database/bank');
        let currency = globalVars.currency
        let balance = await bank.currency.getBalance(message.member.id);
        let inputText = "";
        if (args[1]) inputText = args[1].toLowerCase();
        if (inputText == "quarter") args[1] = balance / 4;
        if (inputText == "half") args[1] = balance / 2;
        if (inputText == "all") args[1] = balance;
        let playerChoice = args[0].toLowerCase();
        amount = args[1];

        // Get input
        let rps = ["rock", "paper", "scissor"];
        if (!rps.includes(playerChoice)) return sendMessage(client, message, `You need to choose between \`rock\`, \`paper\` and \`scissor\`.`);

        if (!amount || isNaN(amount)) return sendMessage(client, message, `You need to specify a valid number to gamble.`);

        // Enforce flooring
        amount = Math.floor(amount);
        balance = Math.floor(balance);

        if (amount <= 0) return sendMessage(client, message, `Please enter an amount that's equal to or larger than 1.`);

        if (amount > balance) {
            return sendMessage(client, message, `You only have ${Math.floor(balance)}${currency}.`);
        };

        // Randomize bot and compare choices
        let botChoice = rps[Math.floor(Math.random() * rps.length)];
        let result = (rps.length + rps.indexOf(playerChoice) - rps.indexOf(botChoice)) % rps.length;
        let returnString = `Congratulations. You picked **${playerChoice}** while I picked **${botChoice}**. \nYou win ${amount}${currency}. You now have ${balance + amount}${currency}.`;

        switch (result) {
            case 0: // Tie
                return sendMessage(client, message, `It's a tie. We both picked **${playerChoice}**.`);
                break;
            case 1: // Player wins, no change necessary
                break;
            case 2: // Player loss
                returnString = `Sorry. You picked **${playerChoice}** while I picked **${botChoice}**. \nYou lose ${amount}${currency}. You now have ${balance - amount}${currency}.`;
                amount = Math.abs(amount) * -1;
                break;
        };

        // Update currency
        bank.currency.add(message.member.id, amount);
        sendMessage(client, message, returnString);

        cooldown.add(message.member.id);

        return setTimeout(() => {
            cooldown.delete(message.member.id);
        }, 1000);

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "rps",
    aliases: [],
    description: "Bet money on a game of rock, paper, scissors.",
    options: [{
        name: "rock",
        type: "SUB_COMMAND",
        description: "Bet on rock.",
        options: [{
            name: "bet-amount",
            type: "INTEGER",
            description: "The amount of money you want to bet.",
        }]
    }, {
        name: "paper",
        type: "SUB_COMMAND",
        description: "Bet on paper.",
        options: [{
            name: "bet-amount",
            type: "INTEGER",
            description: "The amount of money you want to bet.",
        }]
    }, {
        name: "scissors",
        type: "SUB_COMMAND",
        description: "Bet on scissors.",
        options: [{
            name: "bet-amount",
            type: "INTEGER",
            description: "The amount of money you want to bet.",
        }]
    }]
};