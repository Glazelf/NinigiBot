module.exports = (client, message, channel) => {
  // Import totals
  var { totalMessages } = require('./ready');
  var { totalCommands } = require('./ready');

  // +1 messages count
  totalMessages += 1;

  // Ignore all bots
  if (message.author.bot) return;

  // Ignore messages not starting with the prefix
  if (message.content.indexOf(client.config.prefix) !== 0) return;

  // Ignore messages that are just prefix
  if (message.content === client.config.prefix) return;

  // Ignore messages that start with prefix double or prefix space
  var secondCharacter = message.content.charAt(1);
  if (secondCharacter == `${client.config.prefix}` || secondCharacter == ` `) return;

  // Ignore messages that aren't in bot channel or by a mod (except help)
  if (message.channel.id != `${client.config.botChannelID}` && !message.member.hasPermission("MANAGE_MESSAGES") && message != `${client.config.prefix}help`) {
    return message.channel.send(`Sorry <@${message.member.user.id}>, you're not allowed to use commands here, try using commands in: <#${client.config.botChannelID}>.`);
  };

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

  // +1 command count
  totalCommands += 1;

  // Run the command
  cmd.run(client, message, args);
};
