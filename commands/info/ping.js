exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        let pongString = `Pong!'ed back in`;
        let pauseString = `${pongString} (hold on, processing latency...)`;
        let wsLatencyString = `Websocket latency is ${client.ws.ping}ms`;

        let replyText = `Pong! Slash command latency is ${client.ws.ping}ms.`;
        return sendMessage({ client: client, interaction: interaction, content: replyText });


    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "ping",
    description: `Pings bot.`
};