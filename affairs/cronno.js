import { EmbedBuilder } from "discord.js";
import cron from "cron";
import logger from '../util/logger.js';

import globalVars from "../objects/globalVars.json" with { type: "json" };

const timezone = "utc";
const time = '00 00 * * * *'; // Sec Min Hour
const guildID = globalVars.ShinxServerID;
const quotes = [
    '> The server has been so freaking awesome since he left.\nGlaze\'s mom',
    '> I did not like him anyway.\nBot user',
    '> Honestly, deserved.\n-Glaze\'s dad',
    '> Who is Glaze again?\n-J.D. Vance',
    '> The winds of change are real.\n-Mingoids',
    '> With Skaidus this server is just amazing man.\n-Shinx'
];

const pics = [
    'https://i.imgur.com/VHbuYMK.png',
    'https://i.imgur.com/7WP6o0W.jpeg',
    'https://i.imgur.com/VHbuYMK.png',
    'https://i.imgur.com/0vzKV3P.jpeg',
    'https://i.imgur.com/NVXMLVA.jpeg',
    'https://i.imgur.com/VHbuYMK.png',
]

export default async (client) => {
    try {
        if (client.user.id != globalVars.NinigiID) return;
        // Create cronjob
        new cron.CronJob(time, async () => {
            let guild = await client.guilds.fetch(guildID);
            if (!guild) return;

            let channel = guild.channels.cache.get(globalVars.eventChannelID);
            const idx = Math.floor(Math.random() * quotes.length);

            const gifEmbed = new EmbedBuilder()
                .setColor(globalVars.embedColor)
                .setDescription(quotes[idx])
                .setImage(pics[idx]);
            channel.send({
                content: `## FUCK GLAZE!!! :fire: `, embeds: [gifEmbed]
            });
        }, timezone, true);

    } catch (e) {
        logger({ exception: e, client: client });
    };
};