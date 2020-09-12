const cooldown = new Set();

exports.run = (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (cooldown.has(message.author.id)) return message.channel.send(`> You are currently on cooldown from using this command, ${message.author}.`);

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
        if (!rps.includes(playerChoice)) return message.channel.send(`> You need to choose between \`rock\`, \`paper\` and \`scissor\`, ${message.author}.`);

        if (!amount || isNaN(amount)) return message.channel.send(`> You need to specify a valid number to gamble, ${message.author}.`);
        amount = Math.floor(amount);
        if (amount <= 0) return message.channel.send(`> Please enter an amount that's equal to or larger than 1, ${message.author}.`);

        if (amount > balance) {
            return message.channel.send(`> You only have ${Math.floor(balance)}${currency}, ${message.author}.`);
        };

        let botChoice = rps.pick();

        if (botChoice == playerChoice) return message.channel.send(`> It's a tie, ${message.author}. We both picked **${playerChoice}**.`);

        let returnString = `> Congratulations, ${message.author}. You picked **${playerChoice}** while I picked **${botChoice}**.
> You win ${amount}${currency}.`;

        if ((playerChoice == rps[0] && botChoice == rps[1]) || (playerChoice == rps[1] && botChoice == rps[2]) || (playerChoice == rps[2] && botChoice == rps[0])) {
            returnString = `> Sorry, ${message.author}. You picked **${playerChoice}** while I picked **${botChoice}**.
> You lose ${amount}${currency}.`;
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
