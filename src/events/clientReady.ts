import { codeBlock, TextChannel } from 'discord.js';
import type { ExtendedClient } from '../types/global.js';
import getTime from '../util/getTime.js';
import stan from "../affairs/stan.js";
import birthday from "../affairs/birthday.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };

export default async (client: ExtendedClient) => {
    try {
        // Set interactions
        await client.commands.forEach(async (command) => {
            try {
                let commandGuildID = null;
                if (command.guildID) {
                    commandGuildID = command.guildID;
                    if (client.user.id != globalVars.NinigiID) commandGuildID = process.env.DEV_SERVER_ID;
                };
                await client.application.commands.create(command.commandObject as any, commandGuildID);
            } catch (e: any) {
                console.log(e);
            };
        });
        console.log("Loaded interactions!");
        // Affairs
        stan(client);
        birthday(client);
        console.log("Loaded affairs!");

        // Load Splatoon 3 language files
        try {
            const fs = await import('fs');
            const files = await fs.promises.readdir("./submodules/splat3/data/language/");
            for (const file of files) {
                const fileName = file.split(".")[0];
                if (!fileName.endsWith("_full")) continue; // Only count full language files
                const languageKey = fileName.split("_")[0];
                const languageJSON = await import(`../submodules/splat3/data/language/${file}`, { with: { type: "json" } });
                globalVars.splatoon3.languageJSONs[languageKey] = languageJSON.default;
            }
            console.log("Loaded Splatoon 3 language files!");
        } catch (e: any) {
            console.error("Error loading Splatoon 3 language files:", e);
        }

        await client.guilds.fetch();
        await client.application.emojis.fetch();

        let timestamp = getTime();
        let devChannel = await client.channels.fetch(process.env.DEV_CHANNEL_ID);
        const startupStats = `Commands: ${client.commands.size}\nGuilds: ${client.guilds.cache.size}\nChannels: ${client.channels.cache.size}\nUsers: ${client.users.cache.size} (All stats are from cache)`;
        console.log(`${startupStats}\nConnected as ${client.user.username}. (${timestamp})`);
        if (devChannel?.isTextBased()) {
            return (devChannel as TextChannel).send({ content: `Successfully connected. ${codeBlock("fix", startupStats)}` });
        }

    } catch (e: any) {
        console.log(e);
    };
};
