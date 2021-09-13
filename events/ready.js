module.exports = async (client) => {
    try {
        const { bank } = require('../database/bank');
        const { Users } = require('../database/dbObjects');
        const stan = require('../affairs/stan')(client);
        const birthday = require('../affairs/birthday')(client);
        const storedBalances = await Users.findAll();
        storedBalances.forEach(b => bank.currency.set(b.user_id, b));
        const getTime = require('../util/getTime');

        // Set interactions
        if (!client.application?.owner) await client.application?.fetch();

        // Daily rate limit of 200 interactions should only go up if they are fully deleted and readded, not on every boot.
        // let GlobalCommands = ["pokemon", "role", "botinfo", "help", "roleinfo", "serverinfo", "userinfo", "ban", "kick", "mute", "slowmode"];
        let commandsExclude = ["countdown", "sysbot", "rule", "clearinteractions", "dm", "eval", "item", "kill", "moneyadd", "reload", "restart"];

        let NinigiUserID = "592760951103684618";

        if (client.user.id == NinigiUserID) {
            await client.commands.forEach(command => {
                try {
                    if (commandsExclude.includes(command.config.name)) return;
                    client.application?.commands.create(command.config);
                    console.log(`Loaded interaction: ${command.config.name} ✔`);
                    // Server exclusive interactions:
                    // client.guilds.cache.get(client.config.botServerID)?.commands.create(command.config);
                } catch (e) {
                    console.log(e);
                };
            });
        };

        await client.guilds.fetch();

        // Set bot status
        let presence = initPresence();
        client.user.setPresence(presence);

        // List and fetch servers the bot is connected to
        // await client.guilds.cache.forEach(async (guild) => {
        //     await guild.members.fetch();
        // });

        let timestamp = await getTime(client);

        console.log(`Commands: ${client.commands.size}
Guilds: ${client.guilds.cache.size}
Channels: ${client.channels.cache.size}
Users: ${client.users.cache.size} (cached)
Connected as ${client.user.tag}. (${timestamp})`);

    } catch (e) {
        // Log error
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
module.exports.prefix = "?";
module.exports.language = "en";
module.exports.eventChannelID = "752626723345924157"; // General2
//module.exports.eventChannelID = "665274079397281835"; // Old stan channel
//module.exports.eventChannelID = "593014621095329812";  // Testing
module.exports.stanRole = "stan";
module.exports.starboardLimit = 3;
module.exports.battling = { yes: false };
module.exports.presence = initPresence();