exports.run = (client, message) => {
    // Import globals
    let globalVars = require('../../../events/ready');
    try {
        const { set } = require('lodash');
        const roulette = require('../../../affairs/roulette')
        if (!roulette.on) return;

        if (roulette.hadBet(message.author.id)) return message.react('✋');
        const { bank } = require('../../../database/bank');
        let input = message.content.slice(5)
        if (input.includes('help')) return message.channel.send(`The syntax is \`${globalVars.prefix}bet <money>, <numbers or intervals with whitespaces>\`\n For example, \`?bet 50, 1 2 4-6\` bets 50 coins on 1, 2, 4, 5 and 6`);
        if (!/^\s*(\d+),\s*(([1-9]|[12][0-9]|3[0-6])(-([1-9]|[12][0-9]|3[0-6]))?)(?:[ ](([1-9]|[12][0-9]|3[0-6])(-([1-9]|[12][0-9]|3[0-6]))?))*$/.test(input)) return message.react('❌');
        const money = parseInt(input.slice(0, input.indexOf(',')).trim())
        input = input.slice(input.indexOf(',') + 1).trim();
        const betRequests = new Set(input.split(/\s+/));
        const bets = new Set();
        betRequests.forEach(request => {
            const slice = request.indexOf('-')
            if (slice !== -1) {
                const minimum = Math.min(request.substring(0, slice), request.substring(slice + 1));
                const maximum = Math.max(request.substring(0, slice), request.substring(slice + 1));
                for (let i = minimum; i <= maximum; i++) bets.add(`${i}`);
            } else bets.add(request);
        });
        if (bets.size * money > bank.currency.getBalance(message.author.id)) {
            return message.channel.send(`> You don't have enough currency, ${message.author}.
> You only have ${Math.floor(bank.currency.getBalance(message.author.id))}${globalVars.currency}.`);
        };
        bets.forEach(bet => {
            roulette.addBet(bet, message.author.id, 36 * money);
        });

        bank.currency.add(message.author.id, -money * bets.size);
        roulette.players.push(message.author.id);
        return message.react('✔️');

    } catch (e) {
        // log error
        const logger = require('../../../util/logger');

        logger(e, client, message);
    };
};

module.exports = {
    name: "bet",
    aliases: []
};
