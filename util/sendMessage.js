module.exports = async ({ client, interaction, content = null, embeds = null, attachments = null, ephemeral = true, components = null }) => {
    try {
        if (!interaction) return; // Note: interaction can be a message instead

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
        if (attachments) {
            // Ephemeral messages couldn't have attachments, should be enabled now.
            // ephemeral = false;
            if (Array.isArray(attachments)) {
                messageObject['attachments'] = attachments;
            } else {
                messageObject['attachments'] = [attachments];
            };
        };

        // Don't add components to slash commands unless specifically told to do so
        if (components) {
            // Components, i.e. buttons
            if (Array.isArray(components)) {
                messageObject['components'] = components;
            } else {
                if (components.components.length != 0) {
                    messageObject['components'] = [components];
                };
            };
        };
        messageObject['ephemeral'] = ephemeral;
        messageObject['allowedMentions'] = { repliedUser: false, roles: false };

        try {
            return interaction.reply(messageObject);
        } catch (e) {
            // console.log(e);
            return interaction.channel.send(messageObject);
        };

    } catch (e) {
        // Log error
        const logger = require('./logger');

        logger(e, client);
    };
};