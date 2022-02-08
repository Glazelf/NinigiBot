const Discord = require("discord.js");
exports.run = async (client, message) => {
    const logger = require('../../../util/logger');
    // Import globals
    let globalVars = require('../../../events/ready');
    try {
        const sendMessage = require('../../../util/sendMessage');
        const roulette = require('../../../affairs/roulette');
        const { bank } = require('../../../database/bank');
        let process = null;

        const { Prefixes } = require('../../../database/dbObjects');
        let prefix = await Prefixes.findOne({ where: { server_id: message.guild.id } });
        if (prefix) {
            prefix = prefix.prefix;
        } else {
            prefix = globalVars.prefix;
        };

        let avatar = client.user.displayAvatarURL(globalVars.displayAvatarSettings);

        let user = message.member.user;

        roulette.shift()
        if (roulette.on) {
            process = setInterval(() => {
                if (roulette.closeTime()) {
                    roulette.on = false;
                    clearInterval(process);
                    return sendMessage({ client: client, message: message, content: `No one wants to play any more Roulette? Well, see you next time!`, ephemeral: false });
                };

                const result = Math.floor(Math.random() * 37);
                let resultAnnouncement = '';
                let winners = roulette.spin(result);

                if (!winners) resultAnnouncement = 'The house wins! Woops!';
                else {
                    winners.sort((a, b) => b[1] - a[1]);
                    for (let i = 0; i < winners.length; i++) {
                        const winner = winners[i];
                        resultAnnouncement += (i + 1) + ') ' + message.channel.guild.members.cache.find(member => member.user.id === winner[0]).user.username + ` wins ${winner[1]}${globalVars.currency}!\n`;
                        bank.currency.add(message.member.id, winner[1]);
                    };
                };

                const results = new Discord.Embed()
                    .setColor(globalVars.embedColor)
                    .setAuthor({ name: `Roulette`, iconURL: avatar })
                    .setDescription(`Rolling, rolling, rolling like a Wooloo! And the number is... ** ${result} ** !`)
                    .addField("Winners:", resultAnnouncement, false)
                    .setImage('https://betoclock.com/wp-content/uploads/2014/11/runroul1.gif')
                    .setTimestamp();
                sendMessage({ client: client, message: message, embeds: results, ephemeral: false });
            }, 20000);

            const welcome = new Discord.Embed()
                .setColor(globalVars.embedColor)
                .setAuthor({ name: `Roulette`, iconURL: avatar })
                .setDescription('Welcome to the roulette! We hope to see you here!')
                .addField("Rules:", `You bet money on the roulette numbers, from 0 to 36.\nThe syntax is \`${prefix}bet <money>, <numbers or intervals>\`
For example, \`${prefix}bet 50, 1 2 4-6\` bets 50 coins on 1, 2, 4, 5 and 6.
After some time, the roulette spins and we get the winner(s), who gets 36x the bet money they invested on the winning slot.`)
                .setImage('https://i.imgur.com/MPKiQM2.png')
                .setFooter({ text: user.tag })
                .setTimestamp();
            sendMessage({ client: client, message: message, embeds: welcome, ephemeral: false });
        } else {
            clearInterval(process);
            sendMessage({ client: client, message: message, content: `Roulette closed! Hope to see you all again!`, ephemeral: false });
        };

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "roulette",
    aliases: [],
    description: "Initiate a roulette."
};