module.exports = async (client) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('../events/ready');
    try {
        const Discord = require("discord.js");
        const getRandomGif = require("../util/getRandomGif");
        const cron = require("cron");
        const timezone = 'utc';
        const time = '00 00 18 * * *'; // Sec Min Hour, 8pm CEST
        // const time = '* * * * *'; //Sec Min Hour testing
        const gifTags = ['pokemon', 'geass', 'dragon', 'game'];
        const guildID = client.config.botServerID;

        if (client.user.id != globalVars.NinigiID) return;

        // Create cronjob
        new cron.CronJob(time, async () => {
            let guild = await client.guilds.fetch(guildID);
            if (!guild) return;

            let stanRoleID = "743144948328562729";
            let candidates = guild.roles.cache.find(role => role.id == stanRoleID).members.map(m => m.user);
            if (candidates.length < 1) return;

            let randomPick = Math.floor((Math.random() * (candidates.length - 0.1)));
            let candidateRandom = candidates[randomPick];

            // Random gif
            const randomGif = await getRandomGif(gifTags);

            let channel = guild.channels.cache.find(channel => channel.id === globalVars.eventChannelID);

            const gifEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setDescription(`Today's most stannable person is ${candidateRandom.tag}, everyone!`)
                .setImage(randomGif);
            channel.send({ content: candidateRandom.toString(), embeds: [gifEmbed], allowedMentions: { parse: ['users'], users: [candidateRandom.id] } });
        }, timeZone = timezone, start = true);

    } catch (e) {
        // Log error
        logger(e, client);
    };
};

