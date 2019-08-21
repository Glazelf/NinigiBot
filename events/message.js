module.exports = (client, message) => {
  // Ignore all bots
  if (message.author.bot) return;

  // Ignore commands in DMs
  if (message.channel.type == "dm" && message.author.id !== client.config.ownerI) {
    message.author.send(`Sorry but you're not allowed to use commands in private messages!`).catch(console.error);
    return;
  }

  // Ignore messages not starting with the prefix
  if (message.content.indexOf(client.config.prefix) !== 0) return;

  // Standard definition
  const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // Grab the command data from the client.commands Enmap
  const cmd = client.commands.get(command);

  // If that command doesn't exist, exit
  if (!cmd) return message.channel.send("That command doesn't exist.");;

  // Run the command
  cmd.run(client, message, args);
};
