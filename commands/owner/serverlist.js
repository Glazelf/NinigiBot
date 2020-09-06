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
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};
