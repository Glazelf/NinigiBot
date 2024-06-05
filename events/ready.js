import getTime from '../util/getTime.js';

export default async (client) => {
    try {
        // Set interactions
        await client.commands.forEach(async (command) => {
            try {
                let commandServerID = null;
                if (command.config.serverID) commandServerID = command.config.serverID;
                // if (client.user.id != module.exports.NinigiID) commandServerID = client.config.devServerID; // set to test server for test build
                await client.application.commands.create(command.config, commandServerID);
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
        let timestamp = await getTime(client);

        console.log(`Commands: ${client.commands.size}
Guilds: ${client.guilds.cache.size}
Channels: ${client.channels.cache.size}
Users: ${client.users.cache.size} (cached)
Connected as ${client.user.username}. (${timestamp})`);

    } catch (e) {
        console.log(e);
    };
};