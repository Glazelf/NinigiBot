import Discord from "discord.js";
import logger from '../util/logger.js';
import globalVars from "../objects/globalVars.json" with { type: "json" };
import getRandomGif from "../util/getRandomGif.js";
import cron from "cron";
import { incrementStanAmount, checkEvents } from "../database/dbServices/history.api.js";

export default async (client) => {
    try {
        const time = '00 00 18 * * *'; // Sec Min Hour
        const gifTags = ['pokemon', 'geass', 'dragon', 'game'];
        const guildID = globalVars.ShinxServerID;

        if (client.user.id != globalVars.NinigiID) return;
        // Create cronjob
        new cron.CronJob(time, async () => {
            let guild = await client.guilds.fetch(guildID);
            if (!guild) return;
            let stanRoleID = "743144948328562729";
            let stanRole = await guild.roles.fetch(stanRoleID, { force: true });
            let candidates = stanRole.members.map(m => m.user);
            if (candidates.length < 1) return;

            let randomPick = Math.floor((Math.random() * (candidates.length - 0.1)));
            let candidateRandom = candidates[randomPick];

            await incrementStanAmount(candidateRandom.id);
            await checkEvents();
            // Random gif
            const randomGif = await getRandomGif(gifTags);
            if (!randomGif) return;

            let channel = guild.channels.cache.find(channel => channel.id === globalVars.eventChannelID);

            const gifEmbed = new Discord.EmbedBuilder()
                .setColor(globalVars.embedColor)
                .setDescription(`Today's most stannable person is ${candidateRandom.username}, everyone!`)
                .setImage(randomGif);
            channel.send({
                content: candidateRandom.toString(), embeds: [gifEmbed],
                // allowedMentions: { parse: ['users'] }
            });
        });

    } catch (e) {
        logger(e, client);
    };
};