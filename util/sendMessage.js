module.exports = async (client, message, replyText, embeds = null, files = null, ephemeral = true, components = null, slashComponents = false) => {
    try {
        const { DisabledChannels } = require('../database/dbObjects');
        const dbChannels = await DisabledChannels.findAll();
        const channels = dbChannels.map(channel => channel.channel_id);

        if (!message) return;

        // Force hidden if disabled channel
        if (channels.includes(message.channel.id)) {
            if (message.type !== "DEFAULT" && files && ephemeral == true) {
                ephemeral = false
            } else {
                ephemeral = true;
            }
        };

        console.log("1")
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
        console.log("2")
        messageObject['ephemeral'] = ephemeral;
        if (message.type == "DEFAULT") messageObject['allowedMentions'] = { repliedUser: false, roles: false };

        if (message.type == "DEFAULT" && message.deleted == true) return message.channel.send(messageObject);

        console.log("3")
        return message.reply(messageObject);

    } catch (e) {
        // log error
        const logger = require('./logger');

        logger(e, client);
    };
};