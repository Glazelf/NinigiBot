exports.run = (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        let pongString = `> Pong!'ed back at ${message.author} in`;
        let pauseString = `${pongString} (hold on, processing latency...)`;

        if (message.content.startsWith(`${globalVars.prefix}pig`) || message.content.startsWith(`${globalVars.prefix}pog`)) {
            pongString = pongString.split("n").join("");
            pauseString = pauseString.split("n").join("");
        };

        if (message.content[2] == "o") {
            pongString = pongString.split("o").join("i");
            pauseString = pauseString.split("o").join("i");
        };

        return message.channel.send(pauseString).then(m => m.edit(`${pongString} ${m.createdTimestamp - message.createdTimestamp}ms.`));

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "ping",
    description: "Pings bot",
    category: "info",
    aliases: ["pong", "pig", "pog"]
};