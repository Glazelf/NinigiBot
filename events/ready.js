module.exports = async (client) => {
  try {
    const stan = require('../affairs/stan')(client);
    const birthday = require('../affairs/birthday')(client);
    const lotery = require('../affairs/lottery')(client);
    const { bank } = require('../database/bank');
    const { Users } = require('../database/dbObjects');
    const storedBalances = await Users.findAll();
    storedBalances.forEach(b => bank.currency.set(b.user_id, b));
    console.log(`Loaded a total of ${client.commands.size} commands!`);
    console.log(`Ready to serve in ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers, for a total of ${client.users.cache.size} users.`);
    console.log(`Connected as ${client.user.tag}.`);

    // Set bot status
    client.user.setPresence({ activity: { name: 'in Sinnoh' }, status: 'idle' });

    // List servers the bot is connected to
    console.log("Servers:")
    client.guilds.cache.forEach((guild) => {
      console.log(' - ' + guild.name);
    });

  } catch (e) {
    // log error
    console.log(e);
  };
};

module.exports.birthRole = "birthday";
module.exports.botChannelID = "614979959156375567";
module.exports.embedColor = "#219DCD";
module.exports.lackPerms = `you do not have the required permissions to do this.`;
module.exports.prefix = "?";
module.exports.stanChannelID = "665274079397281835"
module.exports.stanRole = "stan";
module.exports.starboardLimit = 3;

module.exports.totalCommands = 0;
module.exports.totalLogs = 0;
module.exports.totalMessages = 0;