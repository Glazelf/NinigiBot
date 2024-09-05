import { codeBlock } from 'discord.js';
import getTime from '../util/getTime.js';
import stan from "../affairs/stan.js";
import birthday from "../affairs/birthday.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };
import config from "../config.json" with { type: "json" };

export default async (client) => {
    try {
        // Set interactions
        await client.commands.forEach(async (command) => {
            try {
                let commandGuildID = null;
                if (command.guildID) {
                    commandGuildID = command.guildID;
                    if (client.user.id != globalVars.NinigiID) commandGuildID = config.devServerID;
                };
                await client.application.commands.create(command.commandObject, commandGuildID);
            } catch (e) {
                console.log(e);
            };
        });
        console.log("Loaded interactions!");
        // Affairs
        stan(client);
        birthday(client);
        console.log("Loaded affairs!");

        await client.guilds.fetch();
        await client.application.emojis.fetch();
        // List and fetch servers the bot is connected to
        // await client.guilds.cache.forEach(async (guild) => {
        //     await guild.members.fetch();
        // });

        let timestamp = getTime();
        let devChannel = await client.channels.fetch(config.devChannelID);
        const startupStats = `Commands: ${client.commands.size}\nGuilds: ${client.guilds.cache.size}\nChannels: ${client.channels.cache.size}\nUsers: ${client.users.cache.size} (All stats are from cache)`;
        console.log(`${startupStats}\nConnected as ${client.user.username}. (${timestamp})`);
        return devChannel.send({ content: `Successfully connected. ${codeBlock("fix", startupStats)}` });

    } catch (e) {
        console.log(e);
    };
};