module.exports = (client, message, channel) => {
  // Import totals
  let totalStats = require('./ready');

  // Ignore all bots
  if (message.author.bot) return;

  // +1 messages count
  totalStats.totalMessages += 1;

  // Ignore messages not starting with the prefix
  if (message.content.indexOf(client.config.prefix) !== 0) return;

  // Ignore messages that are just prefix
  if (message.content === client.config.prefix) return;

  // Ignore messages that start with prefix double or prefix space
  var secondCharacter = message.content.charAt(1);
  if (secondCharacter == `${client.config.prefix}` || secondCharacter == ` `) return;

  // Ignore commands in DMs
  if (message.channel.type == "dm" && message.author.id !== client.config.ownerID && message != `${client.config.prefix}help` && message != `${client.config.prefix}info`) {
    return message.author.send(`Sorry <@${message.member.user.id}>, you're not allowed to use commands other than "${client.config.prefix}help" and "${client.config.prefix}info"  in private messages!`).catch(console.error);
  };

  // Standard definition
  const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // Grab the command data from the client.commands Enmap
  const cmd = client.commands.get(command);

  // If that command doesn't exist, exit
  if (!cmd) return message.channel.send(`Sorry <@${message.member.user.id}>, that command doesn't exist.`);

  // +1 command count and drop message count
  totalStats.totalCommands += 1;
  totalStats.totalMessages -= 1;

  // Run the command
  cmd.run(client, message, args);
};
