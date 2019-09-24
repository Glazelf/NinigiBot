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
    // send msg to owner
    let members = message.channel.members;
    let owner = members.find('id', client.config.ownerID);
    owner.send(`> An error occurred while <@${message.member.user.id}> tried to use a command in <#${message.channel.id}>, check console for more information.`);

    // log error
    console.log(e);

    // return confirmation
    return message.channel.send(`> An error has occurred trying to run the command, <@${message.author.id}>, please use "${client.config.prefix}report" to report the issue.`);
  };
};

module.exports.help = {
  name: "Mute",
  description: "Replies with the same message you sent.",
  usage: `mute [@target] [time]`
}; 