exports.run = (client, message, args) => {
  try {
    if (message.author.id !== client.config.ownerID && message.author.id !== client.config.subOwnerID) {
      return message.channel.send(client.config.lackPerms)
    };

    if (!args || args.length < 1) return message.channel.send("> Must provide a command name to reload, <@${message.member.user.id}>.");
    const commandName = args[0];

    // Check if the command exists and is valid
    if (!client.commands.has(commandName)) {
      return message.channel.send("> That command does not exist, <@${message.member.user.id}>.");
    };

    delete require.cache[require.resolve(`./${commandName}.js`)];

    // Delete and reload the command from the client.commands Enmap
    client.commands.delete(commandName);
    const props = require(`./${commandName}.js`);
    client.commands.set(commandName, props);
    return message.channel.send(`> The command "${client.config.prefix}${commandName}" has been reloaded, <@${message.member.user.id}>.`);
    
  } catch (e) {
    // send msg to owner
    let members = message.channel.members;
    let owner = members.find('id', client.config.ownerID);
    owner.send(`> An error occurred using a command in <#${message.channel.id}> by <@${message.member.user.id}> using a command, check console for more information.`);
    // log error
    console.log(e);
    return message.channel.send(`> An error has occurred trying to run the command, please contact <@${client.config.ownerID}>.`)
  };
};

module.exports.help = {
  name: "Reload",
  description: "Reloads a specific command. Requires ownership of this bot.",
  usage: `reload [command]`
};