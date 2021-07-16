module.exports = async (client) => {
    try {
        const { bank } = require('../database/bank');
        const { Users } = require('../database/dbObjects');
        const stan = require('../affairs/stan')(client);
        const birthday = require('../affairs/birthday')(client);
        const storedBalances = await Users.findAll();
        storedBalances.forEach(b => bank.currency.set(b.user_id, b));
        const getTime = require('../util/getTime');

        // Set slash commands
        if (!client.application?.owner) await client.application?.fetch();

        // Daily rate limit of 200 slash commands should only go up if they are fully deleted and readded, not on every boot.
        // let GlobalCommands = ["pokemon", "role", "botinfo", "help", "roleinfo", "serverinfo", "userinfo", "ban", "kick", "mute", "slowmode"];
        let commandsExclusive = ["sysbot", "rule", "timeleft"];

        let NinigiUserID = "592760951103684618";

        if (client.user.id == NinigiUserID) {
            await client.commands.forEach(command => {
                try {
                    if (commandsExclusive.includes(command.config.name)) return;
                    client.application?.commands.create(command.config);
                    console.log(`Loaded slash command: ${command.config.name} ✔`);
                    // Server exclusive slash command:
                    // client.guilds.cache.get(client.config.botServerID)?.commands.create(command.config);
                } catch (e) {
                    console.log(e);
                };
            });
        };

        // Set bot status
        let presence = initPresence();
        client.user.setPresence(presence);

        // List and fetch servers the bot is connected to
        // await client.guilds.cache.forEach(async (guild) => {
        //     await guild.members.fetch();
        // });

        console.log("Servers:");
        await client.guilds.cache.forEach(async (guild) => {
            console.log(`-${guild.name}`);
        });

        let timestamp = await getTime();

        console.log(`Commands: ${client.commands.size}
Guilds: ${client.guilds.cache.size}
Channels: ${client.channels.cache.size}
Users: ${client.users.cache.size} (cached)
Connected as ${client.user.tag}. (${timestamp})`);

    } catch (e) {
        // log error
        console.log(e);
    };
};

function initPresence() {
    // Alter activity string
    // let presence = { activities: [{ name: 'over Sinnoh', type: 'WATCHING' }], status: 'idle' };
    let presence = { activities: [{ name: 'the Sinnoh League', type: 'COMPETING' }], status: 'idle' };
    return presence;
};

module.exports.birthdayRole = "744719808058228796";
module.exports.botChannelID = "747878956434325626";
module.exports.currency = "💰";
module.exports.embedColor = "#219DCD";
module.exports.lackPerms = "You do not have the required permissions to do this.";
module.exports.prefix = "?";
module.exports.eventChannelID = "752626723345924157"; // General2
//module.exports.eventChannelID = "665274079397281835"; // Old stan channel
//module.exports.eventChannelID = "593014621095329812";  // Testing
module.exports.stanRole = "stan";
module.exports.starboardLimit = 3;
module.exports.battling = { yes: false };
module.exports.presence = initPresence();