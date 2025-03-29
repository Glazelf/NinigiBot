import {
    MessageFlagsBitField,
    MessageObject
} from "discord.js";

export default async ({ interaction, content = "", embeds = [], files = [], components = [], flags = new MessageFlagsBitField }) => {
    if (!interaction) return; // Note: interaction can be a message instead
    // 'DEFAULT' = text message, 'APPLICATION_COMMAND' = slash command
    let messageObject: MessageObject = {
        flags: flags,
        allowedMentions: { parse: ['users', 'roles'], repliedUser: true }
    };
    if (content.length > 0) messageObject.content = content;
    if (embeds.length > 0) messageObject.embeds = embeds;
    if (files.length > 0) messageObject.files = files as [];
    if (components.length > 0) messageObject.components = components as [];
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