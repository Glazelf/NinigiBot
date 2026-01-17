import { codeBlock, TextChannel } from 'discord.js';
import type { ExtendedClient } from '../types/global.js';
import getTime from '../util/getTime.js';
import stan from "../affairs/stan.js";
import birthday from "../affairs/birthday.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };

export default async (client: ExtendedClient) => {
    try {
        // Set interactions
        for (const [, command] of client.commands) {
            try {
                let commandGuildID = null;
                if (command.guildID) {
                    commandGuildID = command.guildID;
                    if (client.user.id != globalVars.NinigiID) {
                        commandGuildID = process.env.DEV_SERVER_ID;
                        // Skip guild commands if DEV_SERVER_ID is not set for non-production bots
                        if (!commandGuildID) {
                            console.log(`Skipping guild command ${command.commandObject.name} - DEV_SERVER_ID not set`);
                            continue;
                        }
                    }
                };
                await client.application.commands.create(command.commandObject as any, commandGuildID);
            } catch (e: any) {
                console.log(`Error registering command ${command.commandObject?.name}:`, e.message || e);
            };
        }
        console.log("Loaded interactions!");
        // Affairs
        stan(client);
        birthday(client);
        console.log("Loaded affairs!");

        try {
            await client.guilds.fetch();
        } catch (e: any) {
            console.log("Warning: Failed to fetch guilds:", e.message);
        }
        
        try {
            await client.application.emojis.fetch();
        } catch (e: any) {
            console.log("Warning: Failed to fetch application emojis:", e.message);
        }

        let timestamp = getTime();
        const startupStats = `Commands: ${client.commands.size}\nGuilds: ${client.guilds.cache.size}\nChannels: ${client.channels.cache.size}\nUsers: ${client.users.cache.size} (All stats are from cache)`;
        console.log(`${startupStats}\nConnected as ${client.user.username}. (${timestamp})`);
        
        if (process.env.DEV_CHANNEL_ID) {
            try {
                let devChannel = await client.channels.fetch(process.env.DEV_CHANNEL_ID);
                if (devChannel?.isTextBased()) {
                    await (devChannel as TextChannel).send({ content: `Successfully connected. ${codeBlock("fix", startupStats)}` });
                }
            } catch (e: any) {
                console.log("Failed to send startup message to dev channel:", e.message);
            }
        }

    } catch (e: any) {
        console.log(e);
    };
};
