exports.run = (client, message) => {
    try {
        if (message.author.id !== client.config.ownerID) {
            return message.channel.send(client.config.lackPerms)
        };

        // Import totals
        let globalVars = require('../events/ready');

        switch (globalVars.togglePins) {
            case 0:
                globalVars.togglePins = 1;
                message.channel.send(`> Reminder to check the pins **enabled**, <@${message.author.id}>.`);
                break;
            case 1:
                globalVars.togglePins = 0;
                message.channel.send(`> Reminder to check the pins **disabled**, <@${message.author.id}>.`);
                break;
        };

    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
    };
};

module.exports.help = {
    name: null,
    description: null,
    usage: null
};
