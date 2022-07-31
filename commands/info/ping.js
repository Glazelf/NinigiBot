exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');

        let ephemeral = true;
        await interaction.deferReply({ ephemeral: ephemeral });


        let commands = client.application.commands.cache.find(command => {
            console.log(command.name)
            command.name == "bet"
        });
        console.log(client.application.commands.cache.size)
        return sendMessage({ client: client, interaction: interaction, content: commands.toString() });

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