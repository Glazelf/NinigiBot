exports.run = (client, message, args) => {
    message.channel.send(`Pong! ${new Date().getTime() - message.createdTimestamp}ms`).catch(console.error);
};

module.exports.help = {
    name: "ping",
    description: "Responds with Pong! and the time it took to process this command.",
    usage: `ping`
};
