exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { Prefixes } = require('../../database/dbObjects');
        let prefix = await Prefixes.findOne({ where: { server_id: message.guild.id } });
        if (prefix) {
            prefix = prefix.prefix;
        } else {
            prefix = globalVars.prefix;
        };

        let pongString = `Pong!'ed back in`;
        let pauseString = `${pongString} (hold on, processing latency...)`;
        let wsLatencyString = `Websocket latency is ${client.ws.ping}ms`;

        // Replace string based on input. For some reason .replaceAll() doesn't work here. Whatever.\
        if (message.content) {
            if (message.content.toLowerCase().startsWith(`${prefix}pig`) || message.content.startsWith(`${prefix}pog`)) {
                pongString = pongString.replace("n", "");
                pauseString = pauseString.replace("n", "");
                wsLatencyString = wsLatencyString.replace("n", "");
            };
            if (message.content[2].toLowerCase() == "o") {
                pongString = pongString.replace("o", "i");
                pauseString = pauseString.replace("o", "i");
                wsLatencyString = wsLatencyString.replace("o", "i");
            };
        };

        // Send message then edit message to reflect difference in creation timestamps
        if (message.type == 'DEFAULT') {
            return message.reply(pauseString).then(m => m.edit({ content: `${pongString} ${m.createdTimestamp - message.createdTimestamp}ms. ${wsLatencyString}.` }));
        } else {
            let replyText = `Pong! Slash command latency is ${client.ws.ping}ms.`;
            return sendMessage(client, message, replyText);
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "ping",
    aliases: ["pong", "pig", "pog"],
    description: `Pings bot.`
};