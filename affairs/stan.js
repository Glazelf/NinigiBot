module.exports = async (client) => {
    const cron = require("cron");
    const timezone = 'cest';
    const time = '00 00 20 * * *'; //Sec Min Hour 
    const guildID = client.config.botServerID;
    const gifTags = ['pokemon', 'lelouch'];
    const Discord = require("discord.js");
    const config = require("../config.json");

    new cron.CronJob(time, async () => {
        // Import globals
        let globalVars = require('../events/ready');
        let guild = client.guilds.cache.get(guildID);
        let candidates = guild.roles.cache.find(role => role.name.toLowerCase() === globalVars.stanRole).members.map(m => m.user);
        if (candidates.length < 1) return;

        const giphyRandom = require("giphy-random");
        const getRandomGif = async () => {
            const randomElement = gifTags[Math.floor(Math.random() * gifTags.length)];

            const { data } = await giphyRandom(config.giphy, {
                tag: randomElement
            });
            return data.image_url;
        };

        const randomGif = await getRandomGif();
        let randomPick = Math.floor((Math.random() * (candidates.length - 0.1)));
        let channel = guild.channels.cache.find(channel => channel.id === globalVars.eventChannelID);

        const gifEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setDescription(`> Today's most stannable person is ${candidates[randomPick]}, everyone!`)
            .setImage(randomGif)
            .setTimestamp();
        channel.send(gifEmbed);
    }, timeZone = timezone, start = true)
};
