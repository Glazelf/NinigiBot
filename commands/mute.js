module.exports.run = async (client, message, args) => {
  try {
    // Import globals
    let globalVars = require('../events/ready');

    if (message.author.id !== globalVars.ownerID) {
      return message.channel.send(globalVars.lackPerms)
    };

    function getUserFromMention(mention) {
      if (!mention) return;

      if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);

        if (mention.startsWith('!')) {
          mention = mention.slice(1);
        };
        return client.users.get(mention);
      };
    };

    if (args[0]) {
      const user = getUserFromMention(args[0]);
      let roleMute = msg.guild.roles.find("name", "Muted");

      if (!user) {
        return message.reply(`> Please use a proper mention if you want to mute someone, ${message.author}.`);
      };

      // this assign the role
      user.addRole(roleMute);

      // sets a timeout to unmute the user.
      setTimeout(() => { user.removeRole(roleMute); }, 60 * 1000);
    };

  } catch (e) {
    // log error
    console.log(e);

    // return confirmation
    return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
  };
};
