exports.run = (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (message.author.id !== client.config.ownerID) {
            return message.reply(globalVars.lackPerms)
        };

        args = message.content.split(' ');
        let guildID = args[1];
        let guild = client.guilds.cache.get(guildID);
        if (!guild) guild = message.guild;

        let baseMessage = `> Here's a list of all channels for ${guild.name}, ${message.author}:`;

        guild.channels.cache.forEach((channel) => {
            baseMessage = `${baseMessage}
> -${channel.name} - ${channel.id}`
        });

        if (baseMessage.length > 2000) baseMessage = baseMessage.substring(0, 1997) + "...";

        return message.channel.send(baseMessage);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.names = {
    name: "channellist",
    aliases: ["channels"]
};