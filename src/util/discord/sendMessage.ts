import {
    MessageFlagsBitField,
    MessageObject,
    Component,
    Interaction,
    AutocompleteInteraction
} from "discord.js";

export default async (interaction: Interaction, components: Array<Component>, flags: MessageFlagsBitField) => {
    // 'DEFAULT' = text message, 'APPLICATION_COMMAND' = slash command
    let messageObject: MessageObject = {
        flags: flags,
        allowedMentions: { parse: ['users', 'roles'], repliedUser: true }
    };
    console.log(components)
    if (components.length > 0) messageObject.components = components as [];
    // let targetUser = interaction.options.getUser("user");
    // if (targetUser) messageObject.allowedMentions = { users: [targetUser.id] };

    if (interaction instanceof AutocompleteInteraction) {
        if (!interaction.channel || !interaction.channel.isSendable()) return;
        return interaction.channel.send(messageObject);
    } else {
        if (!(interaction instanceof AutocompleteInteraction) && interaction.deferred) return interaction.editReply(messageObject);
        return interaction.reply(messageObject);
    };
};