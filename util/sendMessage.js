module.exports = async ({ client, message, content = null, embeds = null, files = null, ephemeral = true, components = null }) => {
    try {
        if (!message) return;

        // 'DEFAULT' = text message, 'APPLICATION_COMMAND' = slash command
        let messageObject = {};
        if (content) messageObject['content'] = content;
        if (embeds) {
            if (Array.isArray(embeds)) {
                messageObject['embeds'] = embeds;
            } else {
                messageObject['embeds'] = [embeds];
            };
        };
        if (files) {
            // Ephemeral messages couldn't have files, should be enabled now.
            // ephemeral = false;
            if (Array.isArray(files)) {
                messageObject['files'] = files;
            } else {
                messageObject['files'] = [files];
            };
        };

        // Don't add components to slash commands unless specifically told to do so
        if (components) {
            // Components, i.e. buttons
            if (Array.isArray(components)) {
                messageObject['components'] = components;
            } else {
                messageObject['components'] = [components];
            };
        };
        messageObject['ephemeral'] = ephemeral;
        messageObject['allowedMentions'] = { repliedUser: false, roles: false };

        try {
            return message.reply(messageObject);
        } catch (e) {
            // console.log(e);
            return message.channel.send(messageObject);
        };

    } catch (e) {
        // Log error
        const logger = require('./logger');

        logger(e, client);
    };
};