exports.run = async (client, message, args = [], language) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const getLanguageString = require('../../util/getLanguageString');
        const { Prefixes } = require('../../database/dbObjects');
        let prefix = await Prefixes.findOne({ where: { server_id: message.guild.id } });
        if (prefix) {
            prefix = prefix.prefix;
        } else {
            prefix = globalVars.prefix;
        };

        let pauseString = await getLanguageString(client, language, 'pingPauseString');
        let pongString = await getLanguageString(client, language, 'pingInitialMessage')
        pongString = `${pongString} ${pauseString}`;
        let wsLatencyString = await getLanguageString(client, language, 'pingWebsocketString');
        wsLatencyString = wsLatencyString.replace('[websocketLatency]', client.ws.ping);

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
            return message.reply({ content: pongString, allowedMentions: { repliedUser: false, roles: false } }).then(m => m.edit({ content: pongString.replace(pauseString, `${m.createdTimestamp - message.createdTimestamp}ms. ${wsLatencyString}`) }));
        } else {
            let replyText = await getLanguageString(client, language, 'pingInteractionString');
            replyText = replyText.replace('[latency]', client.ws.ping);
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