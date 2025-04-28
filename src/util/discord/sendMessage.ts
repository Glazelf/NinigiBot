import {
    MessageFlagsBitField,
    MessageObject
} from "discord.js";

// @ts-ignore
export default async (interaction, components = [], flags = new MessageFlagsBitField) => {
    if (!interaction) return; // Note: interaction can be a message instead
    interaction = interaction.interaction
    // 'DEFAULT' = text message, 'APPLICATION_COMMAND' = slash command
    let messageObject: MessageObject = {
        flags: flags,
        allowedMentions: { parse: ['users', 'roles'], repliedUser: true }
    };
    if (components.length > 0) messageObject.components = components as [];
    // let targetUser = interaction.options.getUser("user");
    // if (targetUser) messageObject.allowedMentions = { users: [targetUser.id] };
    try {

        // ts-ignore 
        if (interaction.deferred) return interaction.editReply(messageObject);
        return interaction.reply(messageObject);
    } catch (e) {
        // console.log(e);
        return interaction.channel.send(messageObject);
    };
};