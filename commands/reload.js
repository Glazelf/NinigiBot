exports.run = (client, message, args) => {
  if (message.author.id !== client.config.ownerID) {
    return message.channel.send(`${client.config.lackPerms}`)
  }
  if (!args || args.length < 1) return message.channel.send("Must provide a command name to reload.");
  const commandName = args[0];
  // Check if the command exists and is valid
  if (!client.commands.has(commandName)) {
    return message.channel.send("That command does not exist");
  }
  delete require.cache[require.resolve(`./${commandName}.js`)];
  // Delete and reload the command from the client.commands Enmap
  client.commands.delete(commandName);
  const props = require(`./${commandName}.js`);
  client.commands.set(commandName, props);
  message.channel.send(`The command ${commandName} has been reloaded`);
};

module.exports.help = {
  name: "Reload",
  description: "Reloads a specific command. Requires ownership of this bot.",
  usage: `reload [command]`
};