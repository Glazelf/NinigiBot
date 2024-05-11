module.exports = async (client) => {
    const logger = require('../util/logger');
    // Import globals
    try {
        const getRandomGif = require("../util/getRandomGif");
        const cron = require("cron");
        const timezone = 'utc';
        const time = '05 00 06 * * *'; // Sec Min Hour, 8am CEST
        const guildID = client.globalVars.ShinxServerID;
        const channelID = client.globalVars.eventChannelID;
        const Discord = require("discord.js");
        const api_user = require('../database/dbServices/user.api');
        const gifTags = ["birthday"];
        if (client.user.id != client.globalVars.NinigiID) return;
        // Create cron job
        new cron.CronJob(time, async () => {
            let guild = await client.guilds.fetch(guildID);
            if (!guild) return;
            let birthdayRoleID = "744719808058228796";
            const birthdayRole = await guild.roles.fetch(birthdayRoleID, { force: true });
            if (!birthdayRole) return;
            let yesterdayCuties = birthdayRole.members;
            yesterdayCuties.forEach(cutie => cutie.roles.remove(birthdayRole));
            let cuties = [];
            let cutiesUsernames = [];
            await guild.members.fetch();
            // For every member check 
            for (m in [...guild.members.cache.values()]) {
                const member = [...guild.members.cache.values()][m];
                const birthday = await api_user.getBirthday(member.id);
                if (birthday) {
                    let now = new Date();
                    // Birthdays are stored as string DDMM instead of being seperated by a -
                    if (now.getDate() === parseInt(birthday.substring(0, 2)) && (now.getMonth() + 1) === parseInt(birthday.substring(2))) {
                        cuties.push(member.user.toString());
                        cutiesUsernames.push(member.user.username);
                        await member.roles.add(birthdayRole);
                    };
                };
            };
            if (cuties.length < 1) return;
            let channel = guild.channels.cache.find(channel => channel.id === channelID);
            // Random gif
            const randomGif = await getRandomGif(gifTags);
            // Create embed
            const gifEmbed = new Discord.EmbedBuilder()
                .setColor(client.globalVars.embedColor)
                .setDescription(`Today is ${cutiesUsernames.join(' and ')}'s birthday, everyone!`)
                .setImage(randomGif);
            channel.send({ embeds: [gifEmbed], content: cuties.join(' ') });
        }, timeZone = timezone, start = true);

    } catch (e) {
        // Log error
        logger(e, client);
    };
};