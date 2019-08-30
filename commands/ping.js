exports.run = (client, message, args, member) => {
    if (!member.hasPermission("MANAGE_MESSAGES")) return message.reply(client.config.lackPerms);
    return message.channel.send(`Pong!'ed back at <@${message.member.user.id}> in ${new Date().getTime() - message.createdTimestamp}ms.`).catch(console.error);
};

module.exports.help = {
    name: "Ping",
    description: "Responds with Pong! and the time it took to process this command.",
    usage: `ping`
};
