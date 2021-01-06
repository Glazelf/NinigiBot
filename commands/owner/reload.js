exports.run = async (client, message, args) => {
  // Import globals
  let globalVars = require('../../events/ready');
  try {
    if (message.author.id !== client.config.ownerID) return message.reply(globalVars.lackPerms);

    const { Prefixes } = require('../../database/dbObjects');
    let prefix = await Prefixes.findOne({ where: { server_id: message.member.guild.id } });
    if (prefix) {
      prefix = prefix.prefix;
    } else {
      prefix = globalVars.prefix;
    };

    if (!args || args.length < 1) return message.channel.send(`> Must provide a command name to reload, ${message.author}.`);
    const commandName = args[0];

    // Check if the command exists and is valid
    if (!client.commands.has(commandName)) {
      return message.channel.send(`> That command does not exist, ${message.author}.`);
    };

    delete require.cache[require.resolve(`./${commandName}.js`)];

    // Delete and reload the command from the client.commands Enmap
    client.commands.delete(commandName);
    const props = require(`./${commandName}.js`);
    client.commands.set(commandName, props);
    return message.channel.send(`> The command \`${prefix}${commandName}\` has been reloaded, ${message.author}.`);

  } catch (e) {
    // log error
    const logger = require('../../util/logger');

    logger(e, client, message);
  };
};

module.exports.config = {
  name: "reload",
  aliases: []
};