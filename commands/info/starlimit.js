exports.run = (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const input = message.content.split(` `, 2);
        let starLimit = input[1];

        if (!starLimit || isNaN(starLimit)) return message.channel.send(`> The current starboard star limit is ${globalVars.starboardLimit}, ${message.author}.`);

        if (message.author.id !== client.config.ownerID) {
            return message.channel.send(globalVars.lackPerms)
        };

        if (starLimit === globalVars.starboardLimit) return message.channel.send(`> The starboard star limit didn't change since it's equal to the number you provided, ${starLimit}, ${message.author}.`);

        globalVars.starboardLimit = starLimit;

        return message.channel.send(`> The starboard star limit was changed to ${starLimit}, ${message.author}.`);

    } catch (e) {
        // log error
        console.log(e);

        // log to dev channel
        let baseMessage = `An error occurred in ${message.channel}!
\`\`\`
${e}
\`\`\``;
        if (baseMessage.length > 2000) baseMessage = baseMessage.substring(0, 1950) + `...
\`\`\``;
        let devChannel = client.channels.cache.get(client.config.devChannelID);
        devChannel.send(baseMessage);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command. The error has already been logged, but please also report this as an issue on the Github page or send a message to Glaze#6669. For links and other information use ${globalVars.prefix}info.`);
    };
};