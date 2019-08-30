exports.run = (client, message, args) => {
    message.channel.send(`Pong!'ed back at <@${message.member.user.id}> in ${new Date().getTime() - message.createdTimestamp}ms.`).catch(console.error);
};

module.exports.help = {
    name: "Ping",
    description: "Responds with Pong! and the time it took to process this command.",
    usage: `ping`
};
