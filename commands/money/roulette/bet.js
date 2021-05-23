exports.run = async (client, message, args = []) => {
    // Import globals
    let globalVars = require('../../../events/ready');
    try {
        const sendMessage = require('../../../util/sendMessage');
        const { set } = require('lodash');
        const roulette = require('../../../affairs/roulette')
        if (!roulette.on) return;
        const { Prefixes } = require('../../../database/dbObjects');
        let prefix = await Prefixes.findOne({ where: { server_id: message.guild.id } });
        if (prefix) {
            prefix = prefix.prefix;
        } else {
            prefix = globalVars.prefix;
        };

        if (roulette.hadBet(message.member.id)) return message.react('✋');
        const { bank } = require('../../../database/bank');
        args = args.join(' ');
        if (args.includes('help')) return sendMessage(client, message, `The syntax is \`${prefix}bet <money>, <numbers or intervals with whitespaces>\`\n For example, \`?bet 50, 1 2 4-6\` bets 50 coins on 1, 2, 4, 5 and 6`, null, null, false);
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
        if (bets.size * money > bank.currency.getBalance(message.member.id)) {
            return sendMessage(client, message, `You don't have enough currency}.\nYou only have ${Math.floor(bank.currency.getBalance(message.member.id))}${globalVars.currency}.`, null, null, false);
        };
        bets.forEach(bet => {
            roulette.addBet(bet, message.member.id, 36 * money);
        });

        bank.currency.add(message.member.id, -money * bets.size);
        roulette.players.push(message.member.id);
        return message.react('✔️');

    } catch (e) {
        // log error
        const logger = require('../../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "bet",
    aliases: [],
    description: "Bet on ongoing roulette.",
    options: [{
        name: "slot-amount",
        type: "INTEGER",
        description: "The amount of slots you want to bet on.",
        required: true
    }, {
        name: "bet-amount",
        type: "INTEGER",
        description: "The amount of money you want to bet on each slot.",
        required: true
    }]
};
