exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        let pongString = `Pong!'ed back in`;
        let pauseString = `${pongString} (hold on, processing latency...)`;
        let wsLatencyString = `Websocket latency is ${client.ws.ping}ms`;

        return interaction.reply({ content: pauseString, allowedMentions: { repliedUser: false, roles: false } }).then(m => m.update({ content: `${pongString} ${m.createdTimestamp - message.createdTimestamp}ms. ${wsLatencyString}.` }));

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "ping",
    description: `Pings bot.`
};