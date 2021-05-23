module.exports = async (client, message, replyText, embed = null, files = null, ephemeral = true, code = null) => {
    try {
        const { DisabledChannels } = require('../database/dbObjects');
        const dbChannels = await DisabledChannels.findAll();
        const channels = dbChannels.map(channel => channel.channel_id);

        // Force hidden if disabled channel
        if (channels.includes(message.channel.id)) ephemeral = true;
        if (!code) code = false;

        // 'DEFAULT' = text message, 'APPLICATION_COMMAND' = slash command
        let messageObject = {};
        if (embed) {
            if (message.type == 'APPLICATION_COMMAND') {
                messageObject['embeds'] = [embed];
            } else {
                messageObject['embed'] = embed;
            };
        };
        if (files) {
            if (Array.isArray(files)) {
                messageObject['files'] = files
            } else {
                messageObject['files'] = [files];
            };
        };
        if (message.type == 'APPLICATION_COMMAND') messageObject['ephemeral'] = ephemeral;
        messageObject['code'] = code;
        return message.reply(replyText, messageObject)

    } catch (e) {
        // log error
        const logger = require('./logger');

        logger(e, client);
    };
};