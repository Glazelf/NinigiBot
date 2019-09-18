exports.run = (client, message, args) => {
    let baseMessage = `This bot is in ${client.guilds.size} servers, <@${message.member.user.id}>:`;

    client.guilds.forEach((guild) => {
        baseMessage = `${baseMessage}
-${guild.name}`
    });

    return message.channel.send(baseMessage);
};

module.exports.help = {
    name: "Serverlist",
    description: "Lists all servers the bot is in.",
    usage: `serverlist`
};