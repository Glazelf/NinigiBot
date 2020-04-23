module.exports.run = async (client, message, args) => {
  try {
    if (message.author.id !== client.config.ownerID) {
      return message.channel.send(client.config.lackPerms)
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
        return message.reply(`> Please use a proper mention if you want to mute someone, <@${message.author.id}.`);
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

module.exports.help = {
  name: null,
  description: null,
  usage: null
  //// Help tags for when this cmd works: 
  // name: "Mute",
  // description: "Mutes the targeted user for a specified amount of time.",
  // usage: `mute [@target] [time]`
}; 