const Discord = require('discord.js');

exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const randomNumber = require('../../util/randomNumber');

        const api_user = require('../../database/dbServices/user.api');
        
        let currency = globalVars.currency
        let balance = await api_user.getMoney(interaction.user.id);

        let amount = interaction.options.getInteger("bet-amount");
        let playerChoice = interaction.options.getString("weapon").toLowerCase();

        // Get input
        let rps = ["rock", "paper", "scissors"];
        if (!rps.includes(playerChoice)) return sendMessage({ client: client, interaction: interaction, content: `You need to choose between \`Rock\`, \`Paper\` and \`Scissors\`.` });

        // Enforce flooring
        amount = Math.floor(amount);
        balance = Math.floor(balance);
        if (amount < 1) return sendMessage({ client: client, interaction: interaction, content: `Input has to be 1 or higher.` });
        if (amount > balance) return sendMessage({ client: client, interaction: interaction, content: `You only have ${Math.floor(balance)}${currency}.` });

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
        api_user.addMoney(interaction.user.id, amount);
        return sendMessage({ client: client, interaction: interaction, content: returnString });

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
        type: Discord.ApplicationCommandOptionType.String,
        description: "Use Rock, Paper or Scissors.",
        required: true,
        autocomplete: true
    }, {
        name: "bet-amount",
        type: Discord.ApplicationCommandOptionType.Integer,
        description: "The amount of money you want to bet.",
        required: true,
        autocomplete: true
    }]
};