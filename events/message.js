module.exports = (client, message) => {
  // Import totals
  var { totalMessages } = require('./ready');
  var { totalCommands } = require('./ready');

  // +1 messages count
  totalMessages += 1;
  // Ignore all bots
  if (message.author.bot) return;

  // Ignore commands in DMs
  if (message.channel.type == "dm" && message.author.id !== client.config.ownerID && message != `${client.config.prefix}help`) {
    message.author.send(`Sorry but you're not allowed to use commands other than "${client.config.prefix}help" in private messages!`).catch(console.error);
    return;
  }

  // Ignore messages not starting with the prefix
  if (message.content.indexOf(client.config.prefix) !== 0) return;

  // Ignore messages that are just prefix
  if (message.content === client.config.prefix) return;

  // Ignore messages that start with prefix double or prefix space
  var secondCharacter = message.content.charAt(1)
  if (secondCharacter == `${client.config.prefix}` || secondCharacter == ` `) return;

  // Standard definition
  const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // Grab the command data from the client.commands Enmap
  const cmd = client.commands.get(command);

  // If that command doesn't exist, exit
  if (!cmd) return message.channel.send("That command doesn't exist.");;

  // Run the command
  totalCommands += 1;
  cmd.run(client, message, args);
};
