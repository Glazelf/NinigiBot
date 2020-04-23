exports.run = (client, message) => {
    try {
        let baseMessage = `> This bot is in ${client.guilds.cache.size} servers, <@${message.author.id}>:`;

        client.guilds.cache.forEach((guild) => {
            baseMessage = `${baseMessage}
> -${guild.name}`
        });

        return message.channel.send(baseMessage);

    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
    };
};

module.exports.help = {
    name: "Serverlist",
    description: "Lists all servers the bot is in.",
    usage: `serverlist`
};