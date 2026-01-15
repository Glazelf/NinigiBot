import {
    MessageFlagsBitField,
    MessageFlags,
    ComponentType
} from "discord.js";

export default async ({ interaction, content = "", embeds = [], files = [], components = [], flags = new MessageFlagsBitField }) => {
    if (!interaction) return; // Note: interaction can be a message instead
    // 'DEFAULT' = text message, 'APPLICATION_COMMAND' = slash command
    let messageObject: any = {};
    if (content) messageObject.content = content;
    if (embeds) {
        if (Array.isArray(embeds)) {
            messageObject.embeds = embeds;
        } else {
            messageObject.embeds = [embeds];
        };
    };
    if (files) {
        if (Array.isArray(files)) {
            messageObject.files = files;
        } else {
            messageObject.files = [files];
        };
    };
    // Don't add components to slash commands unless specifically told to do so
    if (components) {
        // Components, i.e. buttons
        if (Array.isArray(components)) {
            messageObject.components = components;
        } else {
            if (components.components.length != 0) {
                messageObject.components = [components];
            };
        };
    };
    messageObject.flags = flags;
    messageObject.allowedMentions = { parse: ['users', 'roles'], repliedUser: true };
    // let targetUser = interaction.options.getUser("user");
    // if (targetUser) messageObject.allowedMentions = { users: [targetUser.id] };
    try {
        if (interaction.deferred) return interaction.editReply(messageObject);
        return interaction.reply(messageObject);
    } catch (e: any) {
        // console.log(e);
        return interaction.channel.send(messageObject);
    };
};