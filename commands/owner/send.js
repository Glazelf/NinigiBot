const Discord = require("discord.js");
exports.run = async (client, interaction, logger, ephemeral) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const isOwner = require('../../util/isOwner');
        let ownerBool = await isOwner(client, interaction.user);
        if (!ownerBool) return sendMessage({ client: client, interaction: interaction, content: client.globalVars.lackPerms });
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg !== null) ephemeral = ephemeralArg;
        await interaction.deferReply({ ephemeral: ephemeral });
        // Split off command
        let textMessage = interaction.options.getString("input");
        let userIDArg = interaction.options.getString("user-id");
        let channelIDArg = interaction.options.getString("channel-id");
        let attachmentArg = interaction.options.getAttachment("attachment");
        let attachment = null;
        if (attachmentArg) attachment = attachmentArg.url;
        let target;
        let textMessageBlock = Discord.codeBlock(textMessage);
        if (userIDArg || channelIDArg) {
            try {
                if (channelIDArg) target = await client.channels.fetch(channelIDArg);
                if (userIDArg) target = await client.users.fetch(userIDArg);
            } catch (e) {
                // console.log(e);
            };
        } else {
            return sendMessage({ client: client, interaction: interaction, content: `Please provide a user ID or channel ID.` });
        };
        if (!target) return sendMessage({ client: client, interaction: interaction, content: `I could not find a user or channel with that ID.` });
        let targetFormat = null;
        if (channelIDArg) targetFormat = `${target.name} (${target.id}) in **${target.guild.name}** (${target.guild.id})`;
        if (userIDArg) targetFormat = `${target.username} (${target.id})`;
        try {
            let messageObject = { content: textMessage };
            if (attachment) messageObject["files"] = [attachment];
            await target.send(messageObject);
            return sendMessage({ client: client, interaction: interaction, content: `Message sent to ${targetFormat}:${textMessageBlock}`, files: attachment });
        } catch (e) {
            // console.log(e);
            return sendMessage({ client: client, interaction: interaction, content: `Failed to message ${targetFormat}:${textMessageBlock}`, files: attachment });
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "send",
    description: "Sends a message to a channel or user.",
    serverID: ["759344085420605471"],
    options: [{
        name: "input",
        type: Discord.ApplicationCommandOptionType.String,
        description: "Message text.",
        required: true
    }, {
        name: "user-id",
        type: Discord.ApplicationCommandOptionType.String,
        description: "Specify user by ID."
    }, {
        name: "channel-id",
        type: Discord.ApplicationCommandOptionType.String,
        description: "Specify channel by ID."
    }, {
        name: "attachment",
        type: Discord.ApplicationCommandOptionType.Attachment,
        description: "Message attachment."
    }, {
        name: "ephemeral",
        type: Discord.ApplicationCommandOptionType.Boolean,
        description: "Whether the reply will be private."
    }]
};