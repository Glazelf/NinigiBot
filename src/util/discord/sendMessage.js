import {
    MessageFlagsBitField
} from "discord.js";

export default async ({ interaction, content = "", embeds = [], files = [], components = [], flags = new MessageFlagsBitField }) => {
    if (!interaction) return; // Note: interaction can be a message instead
    // 'DEFAULT' = text message, 'APPLICATION_COMMAND' = slash command
    let messageObject = {};
    if (content) messageObject.content = content;
    if (embeds) messageObject.embeds = embeds;
    if (files) messageObject.files = files;
    if (components) messageObject.components = components;
    messageObject.flags = flags;
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