import { ActivityType } from "discord.js";
import getTime from '../util/getTime.js';
import globalVars from "../objects/globalVars.json" with { type: "json" };

export default async (client) => {
    try {
        // Set interactions
        await client.commands.forEach(async (command) => {
            try {
                let commandServerIDs = null;
                if (command.guildIDs) commandServerIDs = command.guildIDs;
                // if (client.user.id != module.exports.NinigiID) commandServerID = client.guildIDs; // set to test server for test build
                await client.application.commands.create(command.commandObject, commandServerIDs);
            } catch (e) {
                console.log(e);
            };
        });
        console.log("Loaded interactions!");

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