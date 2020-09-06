exports.run = (client, message) => {
    // Import globals
    let globalVars = require('../events/ready');
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
        let {logger} = require('../../events/ready');
        logger(e, message.channel);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${globalVars.prefix}info.`);
    };
};
