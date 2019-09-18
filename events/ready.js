module.exports = (client) => {
  console.log(`Ready to serve in ${client.channels.size} channels on ${client.guilds.size} servers, for a total of ${client.users.size} users.`);
  console.log(`Connected as ${client.user.tag}.`)

  // Set bot status
  client.user.setStatus('idle')
  client.user.setActivity('over Sinnoh', { type: 'WATCHING' })

  // List servers the bot is connected to
  console.log("Servers:")
  client.guilds.forEach((guild) => {
    console.log(' - ' + guild.name)
  });
};

module.exports.totalMessages = 0;
module.exports.totalCommands = 0;