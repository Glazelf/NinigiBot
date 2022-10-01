const Discord = require('discord.js');

exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const api_user = require('../../database/dbServices/user.api');
        let currency = globalVars.currency;
        let balance = await api_user.getMoney(interaction.user.id);

        let ephemeral = true;
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg === false) ephemeral = false;
        await interaction.deferReply({ ephemeral: ephemeral });

        // Heads / Tails + Amounts
        let validSides = ["heads", "tails"];
        let winSideArg = interaction.options.getString("side");
        let winSide = "heads";
        if (winSideArg && validSides.includes(winSideArg.toLowerCase())) winSide = winSideArg.toLowerCase();
        let loseSide = "tails";
        if (winSide == "tails") loseSide = "heads";

        let amount = interaction.options.getInteger("bet-amount");

        // Enforce flooring
        amount = Math.floor(amount);
        balance = Math.floor(balance);

        if (amount <= 0) return sendMessage({ client: client, interaction: interaction, content: `Input has to be 1 or higher.` });
        if (amount > balance) return sendMessage({ client: client, interaction: interaction, content: `You only have ${Math.floor(balance)}${currency}.` });

        let returnString = `Congratulations, you flipped **${winSide}** and won ${amount}${currency}. You now have ${balance + amount}${currency}.`;

        // Coinflip randomization, code in brackets is executed only upon a loss
        if (Math.random() >= 0.5) {
            returnString = `Sorry, you flipped **${loseSide}** and lost ${amount}${currency}. You now have ${balance - amount}${currency}.`;
            amount = Math.abs(amount) * -1;
        };

        api_user.addMoney(interaction.user.id, amount);
        sendMessage({ client: client, interaction: interaction, content: returnString, ephemeral: ephemeral });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "coinflip",
    description: "Bet money on a coinflip.",
    options: [{
        name: "bet-amount",
        type: Discord.ApplicationCommandOptionType.Integer,
        description: "The amount of money you want to bet.",
        required: true,
        autocomplete: true
    }, {
        name: "side",
        type: Discord.ApplicationCommandOptionType.String,
        description: "Whether you want to bet on heads or tails.",
        autocomplete: true
    }, {
        name: "ephemeral",
        type: Discord.ApplicationCommandOptionType.Boolean,
        description: "Whether the reply will be private.",
    }]
};