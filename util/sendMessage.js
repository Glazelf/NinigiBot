module.exports = async (client, message, replyText, embed = null, files = null, ephemeral = true, code = null) => {
    try {
        const { DisabledChannels } = require('../database/dbObjects');
        const dbChannels = await DisabledChannels.findAll();
        const channels = dbChannels.map(channel => channel.channel_id);

        // Force hidden if disabled channel
        if (channels.includes(message.channel.id)) ephemeral = true;
        if (!code) code = false;

        // 'DEFAULT' = text message, 'APPLICATION_COMMAND' = slash command
        if (message.type == 'DEFAULT') {
            return message.reply(replyText, { ephemeral: ephemeral, embed: embed, files: files, code: code });
        } else if (message.type == 'APPLICATION_COMMAND') {
            return message.reply(replyText, { ephemeral: ephemeral, embeds: [embed], files: files, code: code })
        } else {
            return message.reply(`Unknown message type.`);
        };

    } catch (e) {
        // log error
        const logger = require('./logger');

        logger(e, client);
    };
};