exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        let pongString = `Pong!'ed back in`;
        let pauseString = `${pongString} (hold on, processing latency...)`;
        let wsLatencyString = `Websocket latency is ${client.ws.ping}ms`;

        // Send message then edit message to reflect difference in creation timestamps
        if (message.type == 'APPLICATION_COMMAND') {
            let replyText = `Pong! Slash command latency is ${client.ws.ping}ms.`;
            return sendMessage(client, message, replyText);
        } else {
            return message.reply({ content: pauseString, allowedMentions: { repliedUser: false, roles: false } }).then(m => m.edit({ content: `${pongString} ${m.createdTimestamp - message.createdTimestamp}ms. ${wsLatencyString}.` }));
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "ping",
    aliases: ["pong", "pig", "pog"],
    description: `Pings bot.`
};