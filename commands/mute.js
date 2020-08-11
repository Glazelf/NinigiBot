module.exports.run = async (client, message, args) => {
  try {
    //Second the user is muted
    let muteTime = 60;
    let split = message.content.split(` `, 3);

    if (split[2]) {
      muteTime = split[2];
      if (isNaN(muteTime) || 1 > muteTime) return message.channel.send(`> Please provide a valid number, ${message.author}.`)
    };

    if (args[0]) {
      const member = message.mentions.members.first();
      if (!member) return message.reply(`> Please use a proper mention if you want to mute someone, ${message.author}.`);
      const role = member.guild.roles.cache.find(role => role.name === "Muted");
      await member.roles.add(role);

      message.channel.send(`> ${member} has been muted for ${muteTime} minute(s), ${message.author}.`)

      // sets a timeout to unmute the user.
      setTimeout(async () => { await member.roles.remove(role) }, muteTime * 60 * 1000);
    };

  } catch (e) {
    // log error
    console.log(e);

    // return confirmation
    return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
  };
};
