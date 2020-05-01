module.exports = (client) => {
  try {
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

module.exports.totalMessages = 0;
module.exports.totalCommands = 0;
module.exports.totalLogs = 0;
