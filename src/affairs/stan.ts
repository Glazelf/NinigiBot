import { EmbedBuilder, TextChannel } from "discord.js";
import type { ExtendedClient } from '../types/global.js';
import cron from "cron";
import logger from '../util/logger.js';
import getRandomGif from "../util/math/getRandomGif.js";
import randomNumber from "../util/math/randomNumber.js";
import {
    incrementStanAmount,
    checkEvents
} from "../database/dbServices/history.api.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };

const timezone = "utc";
const time = '00 00 18 * * *'; // Sec Min Hour
const gifTags = ['pokemon', 'geass', 'dragon', 'game'];
const guildID = globalVars.ShinxServerID;
const stanRoleID = "743144948328562729";

export default async (client: ExtendedClient) => {
    try {
        if (client.user.id != globalVars.NinigiID) return;
        // Create cronjob
        new cron.CronJob(time, async () => {
            let guild = await client.guilds.fetch(guildID);
            if (!guild) return;

            let stanRole = await guild.roles.fetch(stanRoleID, { force: true });
            let candidates: any[] = stanRole.members.map(m => m.user);
            if (candidates.length < 1) return;
            let candidateRandom = candidates[randomNumber(0, candidates.length - 1)];

            await incrementStanAmount(candidateRandom.id);
            await checkEvents();
            // Random gif
            const randomGif = await getRandomGif(gifTags);
            if (!randomGif) return;

            let channel = guild.channels.cache.get(globalVars.eventChannelID);
            if (!channel || !channel.isTextBased()) return;

            const gifEmbed = new EmbedBuilder()
                .setColor(globalVars.embedColor as [number, number, number])
                .setDescription(`Today's most stannable person is ${candidateRandom.username}, everyone!`)
                .setImage(randomGif);
            (channel as TextChannel).send({
                content: candidateRandom.toString(),
                embeds: [gifEmbed.toJSON()],
                allowedMentions: { parse: ['users'] }
            });
        }, timezone, true);

    } catch (e: any) {
        logger({ exception: e, client: client });
    };
};