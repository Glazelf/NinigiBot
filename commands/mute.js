module.exports.run = async (client, message, args) => {
  try {
    //Second the user is muted
    const seconds = 10;

    if (args[0]) {
      const member = message.mentions.members.first();
      if (!member) return message.reply(`> Please use a proper mention if you want to mute someone, <@${message.author.id}.`);
      const role= member.guild.roles.cache.find(role => role.name === "Muted");
      await member.roles.add(role);

      // sets a timeout to unmute the user.
      setTimeout(async () => { await member.roles.remove(role) }, seconds * 1000);
    };

  } catch (e) {
    // log error
    console.log(e);

    // return confirmation
    return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
  };
};
