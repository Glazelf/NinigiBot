exports.run = (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        let PongString = `> Pong!'ed back at ${message.author} in`;
        return message.channel.send(flood)

        return message.channel.send(`${PongString} (hold on, processing latency...)`).then(m => m.edit(`${PongString} ${m.createdTimestamp - message.createdTimestamp}ms.`));
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
