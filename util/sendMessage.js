module.exports = async (client, message, replyText, embeds = null, files = null, ephemeral = true, code = null, components = null, slashComponents = false) => {
    try {
        const { DisabledChannels } = require('../database/dbObjects');
        const dbChannels = await DisabledChannels.findAll();
        const channels = dbChannels.map(channel => channel.channel_id);

        // Force hidden if disabled channel
        if (message) {
            if (channels.includes(message.channel.id)) ephemeral = true;
        };
        if (!code) code = false;

        // 'DEFAULT' = text message, 'APPLICATION_COMMAND' = slash command
        let messageObject = {};
        if (replyText) messageObject['content'] = replyText;
        if (embeds) {
            if (Array.isArray(embeds)) {
                messageObject['embeds'] = embeds;
            } else {
                messageObject['embeds'] = [embeds];
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
        // Don't add components to slash commands unless specifically told to do so
        if (components && ((slashComponents && message.type == 'APPLICATION_COMMAND') || message.type == 'DEFAULT')) {
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

        if (!message || message.deleted == true) {
            return message.channel.send(messageObject);
        } else {
            return message.reply(messageObject);
        };

    } catch (e) {
        // log error
        const logger = require('./logger');

        logger(e, client);
    };
};