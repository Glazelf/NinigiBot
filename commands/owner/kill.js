exports.run = (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (message.author.id !== client.config.ownerID) {
            return message.channel.send(globalVars.lackPerms)
        };

        // send channel a message that you're killing bot [optional]
        message.channel.send(`> Shutting down for ${message.author}...`)
            .then(msg => client.destroy());
        return;

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "kill",
    aliases: ["destroy"]
};