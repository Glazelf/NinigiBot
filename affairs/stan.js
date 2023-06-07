const api_history = require('../database/dbServices/history.api');
module.exports = async (client) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('../events/ready');
    try {
        const Discord = require("discord.js");
        const getRandomGif = require("../util/getRandomGif");
        const cron = require("cron");
        const timezone = 'utc';
        const time = '00 00 18 * * *'; // Sec Min Hour
        const gifTags = ['pokemon', 'geass', 'dragon', 'game'];
        const guildID = globalVars.ShinxServerID;

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

            await api_history.incrementStanAmount(candidateRandom.id);
            await api_history.checkEvents();
            // Random gif
            const randomGif = await getRandomGif(gifTags);
            if (!randomGif) return;

            let channel = guild.channels.cache.find(channel => channel.id === globalVars.eventChannelID);

            const gifEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setDescription(`Today's most stannable person is ${candidateRandom.username}, everyone!`)
                .setImage(randomGif);

            channel.send({
                content: candidateRandom.toString(), embeds: [gifEmbed],
                //allowedMentions: { parse: ['users'] }
            });
        }, timeZone = timezone, start = true);

    } catch (e) {
        // Log error
        logger(e, client);
    };
};