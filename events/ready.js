module.exports = async (client) => {
  try {
    const { bank } = require('../bank');
    const { Users } = require('../storeObjects');
    const storedBalances = await Users.findAll();
    storedBalances.forEach(b => bank.currency.set(b.user_id, b));
    console.log(`Ready to serve in ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers, for a total of ${client.users.cache.size} users.`);
    console.log(`Connected as ${client.user.tag}.`);

    // Set bot status
    client.user.setPresence({ activity: { name: 'in Sinnoh' }, status: 'idle' })

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

module.exports.starboardLimit = 3;
module.exports.lackPerms = `You do not have the required permissions to do this.`;
module.exports.ownerAccount = `Glaze#6669`;
module.exports.ownerID = `232875725898645504`;
module.exports.ownerName = `Glaze`;
module.exports.sysbotID = `696086046685003786`
module.exports.totalCommands = 0;
module.exports.totalLogs = 0;
module.exports.totalMessages = 0;