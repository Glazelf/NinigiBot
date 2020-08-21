module.exports = async (client) => {
    const cron = require("cron");
    const timezone = 'cest';
    const time = '00 20 22 * * 6'; //Sec Min Hour 
    const guildID = client.config.botServerID;
    const channelID = client.config.botChannelID;
    const Discord = require("discord.js");
    const { bank } = require('../database/bank');
    const { search } = require('../gifs/search');
    const { UserItems } = require('../database/dbObjects');
    const { CurrencyShop } = require('../database/dbObjects');

    new cron.CronJob(time, async () => {
        let globalVars = require('../events/ready');
        let guild = client.guilds.cache.get(guildID);
        const number = toString(Math.floor(Math.random() * 9999));
        const winers = [[], [], [], []];
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
                winers[4 - score].push(member.user.username);
                bank.currency.add(member.id, jackpot);
            };
            myTicket.amount -= 1;
            myTicket.amount === 0 ? myTicket.destroy() : myTicket.save();
        });

        let winersLength = 0;
        for (let i = 0; i < 4; i++) {
            winersLength += winers[i].length;
        };

        if (winersLength < 1) return;

        let channel = guild.channels.cache.find(channel => channel.id === channelID);
        const results = new Discord.MessageEmbed()
            .setColor("#219DCD")
            .setTitle('Lottery results')
            .setDescription(`> Welcome back! Here are the results of this week's lottery! Good luck next time!`)
        for (let i = 0; i < 4; i++) {
            if (winers[i].length >= 1) results.addField(`${require('../util/getCardinal')(i + 1)} prize:`, `${winers[i].join(", ")}`, false);
        };
        results.setImage(search("lottery"))
            .setTimestamp();
        channel.send(results);
    }, timeZone = timezone, start = true);
};
