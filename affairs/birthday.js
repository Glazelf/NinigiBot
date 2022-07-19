module.exports = async (client) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('../events/ready');
    try {
        const getRandomGif = require("../util/getRandomGif");
        const cron = require("cron");
        const timezone = 'utc';
        const time = '05 00 06 * * *'; // Sec Min Hour, 8am CEST
        const guildID = globalVars.ShinxServerID;
        const channelID = globalVars.eventChannelID;
        const Discord = require("discord.js");
        const { bank } = require('../database/bank');
        const gifTags = ["birthday"];

        if (client.user.id != globalVars.NinigiID) return;

        // Create cron job
        new cron.CronJob(time, async () => {
            let guild = await client.guilds.fetch(guildID);
            if (!guild) return;

            let birthdayRoleID = "744719808058228796";
            const birthdayRole = guild.roles.cache.find(role => role.id === birthdayRoleID);
            if (!birthdayRole) return;
            let yesterdayCuties = birthdayRole.members;
            yesterdayCuties.forEach(cutie => cutie.roles.remove(birthdayRole));
            const cuties = [];
            await guild.members.fetch();
            // For every member check 
            for (m in [...guild.members.cache.values()]) {
                const member = [...guild.members.cache.values()][m];
                const birthday = await bank.currency.getBirthday(member.id);
                if (birthday) {
                    let now = new Date();
                    if (now.getDate() === parseInt(birthday.substring(0, 2)) && (now.getMonth() + 1) === parseInt(birthday.substring(2))) {
                        cuties.push(member.user.tag);
                        await member.roles.add(birthdayRole);
                    };
                };
            };
            if (cuties.length < 1) return;
            let channel = guild.channels.cache.find(channel => channel.id === channelID);
            // Random gif
            const randomGif = await getRandomGif(gifTags);
            // Create embed
            const gifEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setDescription(`Today's is ${cuties.join(' and ')}'s birthday, everyone!`)
                .setImage(randomGif);
            channel.send({ embeds: [gifEmbed] });
        }, timeZone = timezone, start = true);

    } catch (e) {
        // Log error
        logger(e, client);
    };
};
