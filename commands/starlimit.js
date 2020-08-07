exports.run = (client, message) => {
    try {
        if (message.author.id !== client.config.ownerID) {
            return message.channel.send(client.config.lackPerms)
        };

        // Import totals
        let globalVars = require('../events/ready');

        let starLimit = message.content.slice(11);

        if (!starLimit || isNaN(starLimit)) return message.channel.send(`> The current starboard star limit is ${globalVars.starboardLimit}, <@${message.author.id}>.`);
        if (starLimit === globalVars.starboardLimit) return message.channel.send(`> The starboard star limit didn't change since it's equal to the number you provided, ${starLimit}, <@${message.author.id}>.`);

        globalVars.starboardLimit = starLimit;

        return message.channel.send(`> The starboard star limit was changed to ${starLimit}, <@${message.author.id}>`);

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
