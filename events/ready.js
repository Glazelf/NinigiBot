const Discord = require("discord.js");
module.exports = async (client) => {
    try {
        const stan = require('../affairs/stan')(client);
        const birthday = require('../affairs/birthday')(client);
        // const { bank } = require('../database/bank');
        // const { Users } = require('../database/dbServices/server.api');
        // const storedBalances = await Users.findAll();
        // storedBalances.forEach(b => bank.currency.set(b.user_id, b));
        const getTime = require('../util/getTime');
        // Set interactions
        await client.commands.forEach(async (command) => {
            try {
                let commandServerID = null;
                if (command.config.serverID) commandServerID = command.config.serverID;
                // if (client.user.id != module.exports.NinigiID) commandServerID = client.config.devServerID; // set to test server for test build
                slashCommand = await client.application.commands.create(command.config, commandServerID);
            } catch (e) {
                console.log(e);
            };
        });
        console.log("Loaded interactions!");

        await client.guilds.fetch();
        // Set bot status
        let presence = { activities: [{ name: 'the lake theme', type: Discord.ActivityType.Listening }], status: 'idle' };
        await client.user.setPresence(presence);
        console.log(`Presence set to "${client.user.presence.activities[0].type} ${client.user.presence.activities[0].name}"`);
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
        // Log error
        console.log(e);
    };
};

function initPresence() {
    let presence = { activities: [{ name: 'the lake theme', type: Discord.ActivityType.Listening }], status: 'idle' };
    return presence;
};

module.exports.NinigiID = "592760951103684618";
module.exports.ShinxServerID = "549214833858576395";
module.exports.ShinxServerInvite = "2gkybyu";
// module.exports.ShinxServerID = "759344085420605471"; // Testing
module.exports.currency = "💰";
module.exports.embedColor = "#219DCD";
module.exports.lackPerms = "You do not have the required permissions to do this.";
module.exports.eventChannelID = "752626723345924157"; // General2
// module.exports.eventChannelID = "922972585992532022"; // Testing
module.exports.starboardLimit = 3;
module.exports.battling = { yes: false };
module.exports.displayAvatarSettings = { size: 512, extension: "png", dynamic: true };
module.exports.presence = initPresence();