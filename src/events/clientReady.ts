import { codeBlock, TextChannel } from 'discord.js';
import type { ExtendedClient } from '../types/global.js';
import getTime from '../util/getTime.js';
import stan from "../affairs/stan.js";
import birthday from "../affairs/birthday.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };

export default async (client: ExtendedClient) => {
    try {
        // Set interactions using bulk registration for faster startup
        const globalCommands: any[] = [];
        const guildCommandsMap = new Map<string, any[]>();
        for (const [, command] of client.commands) {
            if (command.guildID) {
                let commandGuildID = command.guildID;
                if (client.user.id != globalVars.NinigiID) {
                    commandGuildID = process.env.DEV_SERVER_ID;
                    if (!commandGuildID) continue;
                }
                const existing = guildCommandsMap.get(commandGuildID) ?? [];
                existing.push(command.commandObject);
                guildCommandsMap.set(commandGuildID, existing);
            } else {
                globalCommands.push(command.commandObject);
            }
        }
        try {
            await client.application.commands.set(globalCommands as any);
        } catch (e: any) {
            console.log("Error registering global commands:", e.message || e);
        }
        for (const [guildID, commands] of guildCommandsMap) {
            try {
                await client.application.commands.set(commands as any, guildID);
            } catch (e: any) {
                console.log(`Error registering guild commands for ${guildID}:`, e.message || e);
            }
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
