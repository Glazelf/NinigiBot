module.exports = (client, member) => {
  const defaultChannel = member.guild.channels.find(channel => channel.permissionsFor(guild.me).has("SEND_MESSAGES"));
  defaultChannel.send(`Welcome ${member.user} to this server.`).catch(console.error);
}
