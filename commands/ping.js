exports.run = (client, message) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {        
        let PongString = `> Pong!'ed back at ${message.author} in`;
        return message.channel.send(`${PongString} (hold on, processing latency...)`).then(m => m.edit(`${PongString} ${m.createdTimestamp - message.createdTimestamp}ms.`));

    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${globalVars.prefix}info.`);
    };
};
