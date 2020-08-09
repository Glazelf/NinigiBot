exports.run = (client, message) => {
    try {
        // Import globals
        let globalVars = require('../events/ready');

        if (message.author.id !== globalVars.ownerID) {
            return message.channel.send(globalVars.lackPerms)
        };

        // send channel a message that you're killing bot [optional]
        message.channel.send(`> Shutting down for <@${message.author.id}>...`)
            .then(msg => client.destroy());

    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
    };
};
