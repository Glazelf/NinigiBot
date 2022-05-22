exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const randomNumber = require('../../util/randomNumber');

        const { bank } = require('../../database/bank');
        let currency = globalVars.currency
        let balance = await bank.currency.getBalance(message.member.id);

        if (!args[0] || !args[1]) return sendMessage({ client: client, interaction: interaction, content: `You need to provide two arguments; Your chosen weapon and an amount to gamble.` });

        let amount;
        if (!isNaN(args[1]) || ["quarter", "half", "all", "random"].includes(args[1])) amount = args[1];
        if (amount == "quarter") amount = balance / 4;
        if (amount == "half") amount = balance / 2;
        if (amount == "all") amount = balance;
        if (amount == "random") amount = randomNumber(1, balance);
        let playerChoice = args[0].toLowerCase();

        // Get input
        let rps = ["rock", "paper", "scissors"];
        if (!rps.includes(playerChoice)) return sendMessage({ client: client, interaction: interaction, content: `You need to choose between \`rock\`, \`paper\` and \`scissors\`.` });

        if (!amount || isNaN(amount)) return sendMessage({ client: client, interaction: interaction, content: `You need to specify a valid number to gamble.` });

        // Enforce flooring
        amount = Math.floor(amount);
        balance = Math.floor(balance);

        if (amount <= 0) return sendMessage({ client: client, interaction: interaction, content: `Please enter an amount that's equal to or larger than 1.` });

        if (amount > balance) {
            return sendMessage({ client: client, interaction: interaction, content: `You only have ${Math.floor(balance)}${currency}.` });
        };

        // Randomize bot and compare choices
        let botChoice = rps[Math.floor(Math.random() * rps.length)];
        let result = (rps.length + rps.indexOf(playerChoice) - rps.indexOf(botChoice)) % rps.length;
        let returnString = `Congratulations. You picked **${playerChoice}** while I picked **${botChoice}**. \nYou win ${amount}${currency}. You now have ${balance + amount}${currency}.`;

        switch (result) {
            case 0: // Tie
                return sendMessage({ client: client, interaction: interaction, content: `It's a tie. We both picked **${playerChoice}**.` });
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
        sendMessage({ client: client, interaction: interaction, content: returnString });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "rps",
    description: "Bet money on a game of rock, paper, scissors.",
    options: [{
        name: "weapon",
        type: "STRING",
        description: "Use Rock, Paper or Scissors.",
        required: true,
        autocomplete: true
    }, {
        name: "bet-amount",
        type: "INTEGER",
        description: "The amount of money you want to bet.",
        required: true,
        autocomplete: true
    }]
};