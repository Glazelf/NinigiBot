import { ActivityType } from "discord.js";
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
        // List and fetch servers the bot is connected to
        // await client.guilds.cache.forEach(async (guild) => {
        //     await guild.members.fetch();
        // });
        let timestamp = getTime();

        let presence = initPresence();
        globalVars.presence = presence;
        // Set bot status
        await client.user.setPresence(presence);
        console.log(`Presence set to "${client.user.presence.activities[0].type} ${client.user.presence.activities[0].name}"`);

        console.log(`Commands: ${client.commands.size}
Guilds: ${client.guilds.cache.size}
Channels: ${client.channels.cache.size}
Users: ${client.users.cache.size} (cached)
Connected as ${client.user.username}. (${timestamp})`);

    } catch (e) {
        console.log(e);
    };
};

function initPresence() {
    let presence = { activities: [{ name: 'the lake theme', type: ActivityType.Listening }], status: 'idle' };
    return presence;
};