module.exports = async (client, message, replyText, ephimeral = false) => {
    try {
        if (message.type == 'text' && editText) {
            return message.reply(replyText).then(m => m.edit(editText));
        } else if (message.type == 'text') {
            return message.reply(replyText);
        } else if (message.type == 'APPLICATION_COMMAND') {
            return message.reply(replyText, { ephimeral: ephimeral });
        } else {
            return message.reply(`Unknown message type.`);
        };

    } catch (e) {
        // log error
        const logger = require('./logger');

        logger(e, client);
    };
};