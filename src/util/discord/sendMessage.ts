import {
    MessageFlagsBitField
} from "discord.js";

export default async ({
    interaction,
    content = "",
    embeds = [],
    files = [],
    components = [],
    flags = new MessageFlagsBitField
}: any) => {
    if (!interaction) return; // Note: interaction can be a message instead
    // 'DEFAULT' = text message, 'APPLICATION_COMMAND' = slash command
    let messageObject = {};
    // @ts-expect-error TS(2339): Property 'content' does not exist on type '{}'.
    if (content) messageObject.content = content;
    if (embeds) {
        if (Array.isArray(embeds)) {
            // @ts-expect-error TS(2339): Property 'embeds' does not exist on type '{}'.
            messageObject.embeds = embeds;
        } else {
            // @ts-expect-error TS(2339): Property 'embeds' does not exist on type '{}'.
            messageObject.embeds = [embeds];
        };
    };
    if (files) {
        if (Array.isArray(files)) {
            // @ts-expect-error TS(2339): Property 'files' does not exist on type '{}'.
            messageObject.files = files;
        } else {
            // @ts-expect-error TS(2339): Property 'files' does not exist on type '{}'.
            messageObject.files = [files];
        };
    };
    // Don't add components to slash commands unless specifically told to do so
    if (components) {
        // Components, i.e. buttons
        if (Array.isArray(components)) {
            // @ts-expect-error TS(2339): Property 'components' does not exist on type '{}'.
            messageObject.components = components;
        } else {
            if (components.components.length != 0) {
                // @ts-expect-error TS(2339): Property 'components' does not exist on type '{}'.
                messageObject.components = [components];
            };
        };
    };
    // @ts-expect-error TS(2339): Property 'flags' does not exist on type '{}'.
    messageObject.flags = flags;
    // @ts-expect-error TS(2339): Property 'allowedMentions' does not exist on type ... Remove this comment to see the full error message
    messageObject.allowedMentions = { parse: ['users', 'roles'], repliedUser: true };
    // let targetUser = interaction.options.getUser("user");
    // if (targetUser) messageObject.allowedMentions = { users: [targetUser.id] };
    try {
        if (interaction.deferred) return interaction.editReply(messageObject);
        return interaction.reply(messageObject);
    } catch (e) {
        // console.log(e);
        return interaction.channel.send(messageObject);
    };
};