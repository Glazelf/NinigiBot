exports.run = async (client, interaction) => {
    const logger = require('../../../util/logger');
    // Import globals
    let globalVars = require('../../../events/ready');
    try {
        const sendMessage = require('../../../util/sendMessage');
        const Discord = require("discord.js");
        const roulette = require('../../../affairs/roulette');
        const { bank } = require('../../../database/bank');
        const randomNumber = require('../../../util/randomNumber');

        let process = null;
        let avatar = client.user.displayAvatarURL(globalVars.displayAvatarSettings);
        roulette.shift();
        await interaction.guild.members.fetch();

        if (roulette.on) {
            process = setInterval(() => {
                if (roulette.closeTime()) {
                    roulette.on = false;
                    clearInterval(process);
                    return interaction.channel.send({ content: `No one wants to play any roulette? Well, see you next time!`, });
                };

                const result = randomNumber(1, 36);
                let resultAnnouncement = '';
                let winners = roulette.spin(result);

                if (!winners) resultAnnouncement = 'The house wins! Woops!';
                else {
                    winners.sort((a, b) => b[1] - a[1]);
                    for (let i = 0; i < winners.length; i++) {
                        const winner = winners[i];
                        resultAnnouncement += (i + 1) + ') ' + interaction.guild.members.cache.find(member => member.id === winner[0]).user.username + ` wins ${winner[1]}${globalVars.currency}!\n`;
                        bank.currency.add(interaction.user.id, winner[1]);
                    };
                };

                const results = new Discord.MessageEmbed()
                    .setColor(globalVars.embedColor)
                    .setAuthor({ name: `Roulette`, iconURL: avatar })
                    .setDescription(`Rolling, rolling, rolling like a Wooloo! And the number is... ** ${result} ** !`)
                    .addField("Winners:", resultAnnouncement, false)
                    .setImage('https://betoclock.com/wp-content/uploads/2014/11/runroul1.gif');

                roulette.on = false;
                clearInterval(process);
                return interaction.channel.send({ embeds: [results] });
            }, 20000);

            const welcome = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor({ name: `Roulette`, iconURL: avatar })
                .setDescription("Welcome to the roulette! We hope you'll participate!")
                .addField("Rules:", `You bet money on the roulette numbers, from 1 to 36 using \`/bet\`.
The roulette will spin and a slot will be chosen, people who bet on that slot will get 36x their slot investment.`)
                .setImage('https://i.imgur.com/MPKiQM2.png');

            return sendMessage({ client: client, interaction: interaction, embeds: welcome, ephemeral: false });
        } else {
            return sendMessage({ client: client, interaction: interaction, content: `A roulette is already ongoing!` });
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "roulette",
    description: "Initiate a roulette."
};