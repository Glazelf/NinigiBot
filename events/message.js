module.exports = (client, message, channel) => {
  // Import totals
  let globalVars = require('./ready');

  // Ignore all bots
  if (message.author.bot) return;

  // +1 messages count
  globalVars.totalMessages += 1;

  // Ignore messages not starting with the prefix
  if (message.content.indexOf(client.config.prefix) !== 0) return;

  // Ignore messages that are just prefix
  if (message.content === client.config.prefix) return;

  // Ignore messages that start with prefix double or prefix space
  let secondCharacter = message.content.charAt(1);
  if (secondCharacter == `${client.config.prefix}` || secondCharacter == ` `) return;

  // Ignore commands in DMs
  if (message.channel.type == "dm") {
    return message.author.send(`> Sorry <@${message.author.id}>, you're not allowed to use commands in private messages!`).catch(console.error);
  };

  // Standard definition
  const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // Grab the command data from the client.commands Enmap
  const cmd = client.commands.get(command);

  // If that command doesn't exist, exit
  if (!cmd) return message.channel.send(`> Sorry <@${message.author.id}>, that command doesn't exist.`);

  // +1 command count and drop message count
  globalVars.totalCommands += 1;
  globalVars.totalMessages -= 1;

  // Run the command
  cmd.run(client, message, args);
};