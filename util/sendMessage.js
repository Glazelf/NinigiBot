module.exports = async (client, message, replyText, ephimeral = true, files = [], code = false) => {
    try {
        // 'DEFAULT' = text message, 'APPLICATION_COMMAND' = slash command
        if (message.type == 'DEFAULT') {
            if (files.length > 0) return message.reply(replyText, { files: files });
            return message.reply(replyText);
        } else if (message.type == 'APPLICATION_COMMAND') {
            if (files.length > 0) return message.reply(replyText, { ephimeral: ephimeral, code: code, files: files })
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