module.exports = async (client) => {
    try {
        const { bank } = require('../database/bank');
        const { Users } = require('../database/dbObjects');
        const stan = require('../affairs/stan')(client);
        const birthday = require('../affairs/birthday')(client);
        const storedBalances = await Users.findAll();
        storedBalances.forEach(b => bank.currency.set(b.user_id, b));

        console.log(`Loaded a total of ${client.commands.size} commands!`);
        console.log(`Ready to serve in ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers, for a total of ${client.users.cache.size} (cached) users.`);
        console.log(`Connected as ${client.user.tag}.`);

        // Set bot status
        client.user.setPresence({ activity: { name: 'in Sinnoh' }, status: 'idle' });

        // List servers the bot is connected to
        console.log("Servers:");
        client.guilds.cache.forEach((guild) => {
            console.log(' - ' + guild.name);
        });

    } catch (e) {
        // log error
        console.log(e);
    };
};

module.exports.birthdayRole = "744719808058228796";
module.exports.botChannelID = "747878956434325626";
module.exports.currency = "💰";
module.exports.embedColor = "#219DCD";
module.exports.lackPerms = `you do not have the required permissions to do this.`;
module.exports.prefix = "?";
// module.exports.prefix = "!"; // Testing
module.exports.eventChannelID = "665274079397281835";
//module.exports.eventChannelID = "593014621095329812";  // Testing
module.exports.stanRole = "stan";
module.exports.starboardLimit = 3;
module.exports.battling = { yes: false };