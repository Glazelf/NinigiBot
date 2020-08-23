

exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {
        const roulette = require('../affairs/roulette');
        const { bank } = require('../database/bank');
        const Discord = require("discord.js");
        let process = null;

        let avatar = null;
        if (client.user.avatarURL()) avatar = client.user.avatarURL({ format: "png"});

        roulette.shift()
        if (roulette.on) {
            process = setInterval(() => {
                if (roulette.closeTime()) {
                    roulette.on = false;
                    clearInterval(process);
                    return message.channel.send('> No one wants to play any more Roulette? Well, see you next time!');
                };

                const result = Math.floor(Math.random() * 37);
                let resultAnnouncement = '';
                let winners = roulette.spin(result);

                if (!winners) resultAnnouncement = 'The house wins! Woops!';
                else {
                    winners = winners.sort((a, b) => b[1] - a[1]);
                    for (let i = 0; i < winners.length; i++) {
                        const winner = winners[i];
                        resultAnnouncement += (i + 1) + ') ' + message.channel.guild.members.cache.find(member => member.user.id === winner[0]).user.username + ` wins ${winner[1]}💰!\n`;
                        bank.currency.add(message.author.id, winner[1]);
                    };
                };

                const results = new Discord.MessageEmbed()
                    .setColor("#219DCD")
                    .setAuthor(`Roulette`, avatar)
                    .setDescription(`Rolling, rolling, rolling like a Wooloo! And the number is... **${result}**!`)
                    .addField("Winners:", resultAnnouncement, false)
                    .setImage('https://betoclock.com/wp-content/uploads/2014/11/runroul1.gif')
                    .setTimestamp();
                message.channel.send(results);
            }, 13000);

            const welcome = new Discord.MessageEmbed()
                .setColor("#219DCD")
                .setAuthor(`Roulette`, avatar)
                .setDescription('Welcome to the roulette! We hope to see you here!')
                .addField("Rules:", `You bet money on the roulette numbers, from 0 to 36.\nThe syntax is \`${globalVars.prefix}bet <money>, <numbers or intervals with whitespaces>\`
For example, \`${globalVars.prefix}bet 50, 1 2 4-6\` bets 50 coins on 1, 2, 4, 5 and 6.
After some time, the roulette spins and we get the winer(s), who gets 36x the bet money they invested on the winning slot.`, false)
                .setImage('https://i.imgur.com/MPKiQM2.png')
                .setTimestamp();
            message.channel.send(welcome);
        } else {
            clearInterval(process);
            message.channel.send('> Roulette closed! Hope to see you all again!');
        };

    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
    };
};

