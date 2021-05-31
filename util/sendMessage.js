module.exports = async (client, message, replyText, embed = null, files = null, ephemeral = true, code = null, components = null) => {
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
            // Ephemeral messages don't support attachments
            ephemeral = false;
            if (Array.isArray(files)) {
                messageObject['files'] = files;
            } else {
                messageObject['files'] = [files];
            };
        };
        if (components) {
            // Components, i.e. buttons
            if (Array.isArray(components)) {
                messageObject['components'] = components;
            } else {
                messageObject['components'] = [components];
            };
        };
        if (message.type == 'APPLICATION_COMMAND') messageObject['ephemeral'] = ephemeral;
        if (message.type == "DEFAULT") messageObject['allowedMentions'] = { repliedUser: false, roles: false };
        messageObject['code'] = code;

        if (message.deleted == true) {
            return message.channel.send(replyText, messageObject);
        } else {
            return message.reply(replyText, messageObject);
        };

    } catch (e) {
        // log error
        const logger = require('./logger');

        logger(e, client);
    };
};