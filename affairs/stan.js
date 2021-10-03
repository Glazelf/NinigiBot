module.exports = async (client) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('../events/ready');
    try {
        const getLanguageString = require('../util/getLanguageString');
        const Discord = require("discord.js");
        const cron = require("cron");
        const timezone = 'cest';
        const time = '00 00 20 * * *'; //Sec Min Hour, 8pm
        // const time = '* * * * *'; //Sec Min Hour testing
        const guildID = client.config.botServerID;
        const gifTags = ['pokemon', 'geass', 'dragon', 'game'];
        const { Languages } = require('../database/dbObjects');
        const giphyRandom = require("giphy-random");
        const config = require("../config.json");

        if (client.user.id != "592760951103684618") return;

        // Create cronjob
        new cron.CronJob(time, async () => {
            let dbLanguage = await Languages.findOne({ where: { server_id: client.config.botServerID } });
            let language = globalVars.language;
            if (dbLanguage) language = dbLanguage.language;

            let guild = client.guilds.cache.get(guildID);
            if (!guild) return;

            let candidates = guild.roles.cache.find(role => role.name.toLowerCase() === globalVars.stanRole).members.map(m => m.user);
            if (candidates.length < 1) return;

            // Random gif
            const randomGif = await getRandomGif();
            let randomPick = Math.floor((Math.random() * (candidates.length - 0.1)));
            let candidateRandom = candidates[randomPick];

            let channel = guild.channels.cache.find(channel => channel.id === globalVars.eventChannelID);

            let stanAffairDescription = await getLanguageString(client, language, 'stanAffairDescription');
            let stanDescription = stanAffairDescription.replace('[userTag]', `**${candidateRandom.tag}**`);

            const gifEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setDescription(stanDescription)
                .setImage(randomGif)
                .setTimestamp();
            channel.send({ content: candidateRandom.toString(), embeds: [gifEmbed] });
        }, timeZone = timezone, start = true);

        // Get random gif
        const getRandomGif = async () => {
            const randomElement = gifTags[Math.floor(Math.random() * gifTags.length)];

            const { data } = await giphyRandom(config.giphy, {
                tag: randomElement
            });
            return data.image_url;
        };

    } catch (e) {
        // Log error
        logger(e, client);
    };
};

