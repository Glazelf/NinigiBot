exports.run = (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (message.author.id !== client.config.ownerID) {
            return message.channel.send(client.config.lackPerms)
        };

        // send channel a message that you're resetting bot [optional]
        message.channel.send(`> Restarting for ${message.author}...`)
            .then(msg => client.destroy())
            .then(() => client.login(client.config.token))
            .then(message.channel.send(`> Successfully restarted!`));
        return;

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};
