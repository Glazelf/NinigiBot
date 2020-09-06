exports.run = (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (message.author.id !== client.config.ownerID) {
            return message.channel.send(globalVars.lackPerms)
        };

        let guildID = message.content.slice(12);
        let guild = client.guilds.cache.get(guildID);

        if (!guild) {
            let baseMessage = `> Since you didn't provide an ID, ${message.author}, here is a list of serverIDs instead:`
            client.guilds.cache.forEach((guild) => {
                baseMessage = `${baseMessage}
    > -${guild.name} - ${guild.id}`
            });
        };

        guild.fetchInvites()
            .then(invites => message.channel.send(`> ${message.author}, I found the following invites:\n` + invites.map(invite => invite).join(`\n`)))
            .catch(console.error);
        return;

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};
