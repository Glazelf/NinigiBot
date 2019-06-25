exports.run = (client, message, [mention, ...reason]) => {
  if (!member.hasPermission('KICK_MEMBERS'))
    return console.log("You don't have permission to kick people!");

  if (message.mentions.members.size === 0)
    return message.reply("Please mention a user to kick.");

  if (!message.guild.me.hasPermission("KICK_MEMBERS"))
    return message.reply("I don't have permission to kick people! :(");

  const kickMember = message.mentions.members.first();

  kickMember.kick(reason.join(" ")).then(member => {
    message.reply(`${member.user.username} was succesfully kicked.`);
  });
};

module.exports.help = {
  name: "kick",
  description: "Kicks a user.",
  usage: `kick [@user]`
};