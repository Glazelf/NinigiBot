exports.run = (client, message, args) => {
    var baseMessage = `**Servers (${client.guilds.size}):**`;

    client.guilds.forEach((guild) => {
        baseMessage = `${baseMessage}
-${guild.name} (${guild.size} users).`
    });

    return message.channel.send(baseMessage);
};

module.exports.help = {
    name: "Serverlist",
    description: "Lists all servers the bot is in.",
    usage: `serverlist`
};