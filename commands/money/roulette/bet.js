exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../../util/logger');
    // Import globals
    let globalVars = require('../../../events/ready');
    try {
        const sendMessage = require('../../../util/sendMessage');
        const roulette = require('../../../affairs/roulette')
        const { bank } = require('../../../database/bank');

        if (!roulette.on) return sendMessage({ client: client, interaction: interaction, content: `There is currently no roulette going on. Use \`/roulette start\` to start one.` }); // Add /roulette start functionality
        if (roulette.hadBet(message.member.id)) return message.react('✋');

        args = args.join(' ');

        if (!/^\s*(\d+),\s*(([1-9]|[12][0-9]|3[0-6])(-([1-9]|[12][0-9]|3[0-6]))?)(?:[ ](([1-9]|[12][0-9]|3[0-6])(-([1-9]|[12][0-9]|3[0-6]))?))*$/.test(args)) return message.react('❌');

        const money = parseInt(args.slice(0, args.indexOf(',')).trim())
        args = args.slice(args.indexOf(',') + 1).trim();
        const betRequests = new Set(args.split(/\s+/));
        const bets = new Set();
        betRequests.forEach(request => {
            const slice = request.indexOf('-')
            if (slice !== -1) {
                const minimum = Math.min(request.substring(0, slice), request.substring(slice + 1));
                const maximum = Math.max(request.substring(0, slice), request.substring(slice + 1));
                for (let i = minimum; i <= maximum; i++) bets.add(`${i}`);
            } else bets.add(request);
        });

        let dbBalance = await bank.currency.getBalance(message.member.id);
        if (bets.size * money > dbBalance) {
            return sendMessage({ client: client, interaction: interaction, content: `You don't have enough currency}.\nYou only have ${Math.floor(dbBalance)}${globalVars.currency}.` });
        };
        bets.forEach(bet => {
            roulette.addBet(bet, message.member.id, 36 * money);
        });

        bank.currency.add(message.member.id, -money * bets.size);
        roulette.players.push(message.member.id);
        return message.react('✔️');

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "bet",
    description: "Bet on ongoing roulette.",
    options: [{
        name: "slot-amount",
        type: 4,
        description: "The amount of slots you want to bet on.",
        required: true
    }, {
        name: "bet-amount",
        type: 4,
        description: "The amount of money you want to bet on each slot.",
        required: true
    }]
};
