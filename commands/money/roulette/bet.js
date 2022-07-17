const Discord = require("discord.js");
exports.run = async (client, interaction) => {
    const logger = require('../../../util/logger');
    // Import globals
    let globalVars = require('../../../events/ready');
    try {
        const sendMessage = require('../../../util/sendMessage');
        const roulette = require('../../../affairs/roulette')
        const { bank } = require('../../../database/bank');

        if (!roulette.on) return sendMessage({ client: client, interaction: interaction, content: `There is currently no roulette going on. Use \`/roulette\` to start one.` });
        if (roulette.hadBet(interaction.user.id)) return sendMessage({ client: client, interaction: interaction, content: `You already placed a bet.` });

        let ephemeral = true;
        await interaction.deferReply({ ephemeral: ephemeral });

        let firstSlot = interaction.options.getInteger("first-slot");
        let lastSlot = interaction.options.getInteger("last-slot");
        let betAmount = interaction.options.getInteger("bet-amount");

        if (lastSlot < firstSlot) return sendMessage({ client: client, interaction: interaction, content: `Your first number has to be lower than your second number.` });
        if (firstSlot < 1 || lastSlot < 1 || firstSlot > 36 || lastSlot > 36) return sendMessage({ client: client, interaction: interaction, content: `Both of your numbers have to be between 1 and 36.` });

        const bets = new Set();
        for (let i = firstSlot; i <= lastSlot; i++) {
            bets.add(i);
        };

        let dbBalance = await bank.currency.getBalance(interaction.user.id);
        if (bets.size * betAmount > dbBalance) {
            return sendMessage({ client: client, interaction: interaction, content: `You don't have enough currency}.\nYou only have ${Math.floor(dbBalance)}${globalVars.currency}.` });
        };
        await bets.forEach(bet => {
            roulette.addBet(bet, interaction.user.id, 36 * betAmount);
        });

        bank.currency.add(interaction.user.id, -betAmount * bets.size);
        roulette.players.push(interaction.user.id);
        return sendMessage({ client: client, interaction: interaction, content: `Placed your bet.` });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "bet",
    description: "Bet on an ongoing roulette.",
    options: [{
        name: "first-slot",
        type: Discord.ApplicationCommandOptionType.Integer,
        description: "The first slot you want to bet on.",
        required: true
    }, {
        name: "last-slot",
        type: Discord.ApplicationCommandOptionType.Integer,
        description: "The last slot you want to bet on.",
        required: true
    }, {
        name: "bet-amount",
        type: Discord.ApplicationCommandOptionType.Integer,
        description: "The amount of money you want to bet on each slot.",
        required: true
    }]
};
