exports.run = (client, message, args) => {
    message.channel.send(`Leeroy Jenkins!'ed back at you in ${new Date().getTime() - message.createdTimestamp}ms.`).catch(console.error);
};

module.exports.help = {
    name: "Ping",
    description: "Responds with Pong! and the time it took to process this command.",
    usage: `ping`
};
