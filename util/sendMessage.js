module.exports = async (client, message, replyText, ephimeral = true, files = null, code = false) => {
    try {
        const { DisabledChannels } = require('../database/dbObjects');
        const dbChannels = await DisabledChannels.findAll();
        const channels = dbChannels.map(channel => channel.channel_id);

        // Force hidden if disabled channel
        if (channels.includes(message.channel.id)) ephimeral = true;

        // 'DEFAULT' = text message, 'APPLICATION_COMMAND' = slash command
        if (message.type == 'DEFAULT') {
            if (Array.isArray(files)) return message.reply(replyText, { files: files, code: code });
            return message.reply(replyText, { code: code });

        } else if (message.type == 'APPLICATION_COMMAND') {
            if (Array.isArray(files)) return message.reply(replyText, { ephimeral: ephimeral, files: files, code: code })
            return message.reply(replyText, { ephimeral: ephimeral, code: code });

        } else {
            return message.reply(`Unknown message type.`);
        };

    } catch (e) {
        // log error
        const logger = require('./logger');

        logger(e, client);
    };
};