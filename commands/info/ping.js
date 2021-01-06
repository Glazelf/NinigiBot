exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const { Prefixes } = require('../../database/dbObjects');
        let prefix = await Prefixes.findOne({ where: { server_id: message.member.guild.id } });
        if (prefix) {
            prefix = prefix.prefix;
        } else {
            prefix = globalVars.prefix;
        };

        let pongString = `> Pong!'ed back at ${message.author} in`;
        let pauseString = `${pongString} (hold on, processing latency...)`;

        // Replace string based on input. For some reason .replaceAll() doesn't work here. Whatever.
        if (message.content.toLowerCase().startsWith(`${prefix}pig`) || message.content.startsWith(`${prefix}pog`)) {
            pongString = pongString.split("n").join("");
            pauseString = pauseString.split("n").join("");
        };
        if (message.content[2] == "o") {
            pongString = pongString.split("o").join("i");
            pauseString = pauseString.split("o").join("i");
        };

        // Send message then edit message to reflect difference in creation timestamps
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