module.exports = async ({ client, interaction, content = null, embeds = null, files = null, ephemeral = true, components = null }) => {
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
        if (files) {
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
                if (components.components.length != 0) {
                    messageObject['components'] = [components];
                };
            };
        };
        messageObject['ephemeral'] = ephemeral;
        messageObject['allowedMentions'] = { parse: ['users', 'roles'], repliedUser: true };
        // let targetUser = interaction.options.getUser("user");
        // if (targetUser) messageObject['allowedMentions'] = { users: [targetUser.id] };

        try {
            if (interaction.deferred) return interaction.editReply(messageObject);
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