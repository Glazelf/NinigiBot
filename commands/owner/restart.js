exports.run = (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (message.author.id !== client.config.ownerID) return message.reply(client.config.lackPerms);

        // send channel a message that you're resetting bot [optional]
        message.reply(`Restarting...`)
            .then(msg => client.destroy())
            .then(() => client.login(client.config.token))
            .then(message.reply(`Successfully restarted!`));
        return;

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "restart",
    aliases: []
};