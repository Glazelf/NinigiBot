const cooldown = new Set();

exports.run = (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (cooldown.has(message.author.id)) return message.reply(`You are currently on cooldown from using this command.`);

        const { bank } = require('../../database/bank');
        let currency = globalVars.currency
        let balance = bank.currency.getBalance(message.author.id);
        const input = message.content.split(` `);
        let inputText = "";
        if (input[2]) inputText = input[2].toLowerCase();
        if (inputText == "quarter") input[2] = balance / 4;
        if (inputText == "half") input[2] = balance / 2;
        if (inputText == "all") input[2] = balance;
        let playerChoice = input[1].toLowerCase();
        amount = input[2];

        let rps = ["rock", "paper", "scissor"];
        if (!rps.includes(playerChoice)) return message.reply(`You need to choose between \`rock\`, \`paper\` and \`scissor\`.`);

        if (!amount || isNaN(amount)) return message.reply(`You need to specify a valid number to gamble.`);
        amount = Math.floor(amount);
        if (amount <= 0) return message.reply(`Please enter an amount that's equal to or larger than 1.`);

        if (amount > balance) {
            return message.reply(`You only have ${Math.floor(balance)}${currency}.`);
        };

        let botChoice = rps[Math.floor(Math.random() * rps.length)];

        if (botChoice == playerChoice) return message.reply(`It's a tie. We both picked **${playerChoice}**.`);

        let returnString = `Congratulations. You picked **${playerChoice}** while I picked **${botChoice}**.
> You win ${amount}${currency}.`;

        if ((playerChoice == rps[0] && botChoice == rps[1]) || (playerChoice == rps[1] && botChoice == rps[2]) || (playerChoice == rps[2] && botChoice == rps[0])) {
            returnString = `Sorry. You picked **${playerChoice}** while I picked **${botChoice}**.
> You lose ${amount}${currency}.`;
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