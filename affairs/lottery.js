module.exports = async (client) => {
    // Import globals
    let globalVars = require('../events/ready');

    const cron = require("cron");
    const timezone = 'cest';
    const time = '00 00 22 * * 6'; //Sec Min Hour 
    const guildID = client.config.botServerID;
    const channelID = globalVars.eventChannelID;
    const Discord = require("discord.js");
    const { bank } = require('../database/bank');
    const { search } = require('../util/search');
    const { UserItems } = require('../database/dbObjects');
    const { CurrencyShop } = require('../database/dbObjects');

    new cron.CronJob(time, async () => {
        let guild = client.guilds.cache.get(guildID);
        if (!guild) return;
        const number = `${Math.floor(Math.random() * 10000)}`;
        const winners = [[], [], [], []];
        const ticket = await CurrencyShop.findOne({ where: { name: 'Lottery ticket' } });
        let participants = await UserItems.findAll({ include: ['item'] });
        participants = participants.filter(lol => lol.item.name === ticket.name);
        participants.forEach(myTicket => {
            const member = guild.members.cache.get(myTicket.user_id);
            let score = 0;
            const discriminator = member.user.discriminator;
            for (let i = 0; i < number.length; i++) {
                if (number[i] === discriminator[i]) score += 1;
            };
            const jackpot = -20 * (score ** 4) + 205 * (score ** 3) - 445 * (score ** 2) + 280 * score;
            if (score > 0) {
                winners[4 - score].push(member.user.username);
                bank.currency.add(member.id, jackpot);
            };
            myTicket.amount -= 1;
            myTicket.amount === 0 ? myTicket.destroy() : myTicket.save();
        });

        let winnersLength = 0;
        for (let i = 0; i < 4; i++) {
            winnersLength += winners[i].length;
        };

        let channel = guild.channels.cache.find(channel => channel.id === channelID);
        const results = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setTitle('Lottery results')
            .setDescription(`> Welcome back! And the winning number is **${number}**! Here are the winners of this week's lottery! Good luck next time!`)
        if (winnersLength < 1) {
            results.addField('Results:', 'No one won anything! Well more luck next time!')
        } else {
            for (let i = 0; i < 4; i++) {
                if (winners[i].length >= 1) results.addField(`${require('../util/getCardinal')(i + 1)} prize:`, `${winners[i].join(", ")}`, false);
            };
        }

        results.setImage(search("lottery"))
            .setTimestamp();
        channel.send(results);
    }, timeZone = timezone, start = true);
};
