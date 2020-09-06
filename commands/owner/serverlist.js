exports.run = (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (message.author.id !== client.config.ownerID) {
            return message.reply(globalVars.lackPerms)
        };

        let baseMessage = `> This bot is in ${client.guilds.cache.size} servers, ${message.author}:`;

        client.guilds.cache.forEach((guild) => {
            baseMessage = `${baseMessage}
> -${guild.name} - ${guild.id}`
        });

        if (baseMessage.length > 2000) baseMessage = baseMessage.substring(0, 1997) + "...";

        return message.channel.send(baseMessage);

    } catch (e) {
        // log error
        let { logger } = require('../../events/ready');
        logger(e, message.channel);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${globalVars.prefix}info.`);
    };
};
