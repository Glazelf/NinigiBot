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


}

// Create global variables
var totalMessages = 0;
var totalCommands = 0;

// Export global variables
module.exports = { totalMessages };
module.exports = { totalCommands };