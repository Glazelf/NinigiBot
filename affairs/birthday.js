import { EmbedBuilder } from "discord.js";
import logger from '../util/logger.js';
import globalVars from "../objects/globalVars.json" with { type: "json" };
import getRandomGif from "../util/getRandomGif.js";
import cron from "cron";
import { getBirthday } from "../database/dbServices/user.api.js";

export default async (client) => {
    try {
        let timezone = "utc";
        const time = '05 00 06 * * *'; // Sec Min Hour, 8am CEST
        const guildID = globalVars.ShinxServerID;
        const channelID = globalVars.eventChannelID;
        const gifTags = ["birthday"];
        if (client.user.id != globalVars.NinigiID) return;
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
            for (const m in [...guild.members.cache.values()]) {
                const member = [...guild.members.cache.values()][m];
                const birthday = await getBirthday(member.id);
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
            const gifEmbed = new EmbedBuilder()
                .setColor(globalVars.embedColor)
                .setDescription(`Today is ${cutiesUsernames.join(' and ')}'s birthday, everyone!`)
                .setImage(randomGif);
            channel.send({ embeds: [gifEmbed], content: cuties.join(' ') });
        }, timezone, true);

    } catch (e) {
        logger({ exception: e, client: client });
    };
};