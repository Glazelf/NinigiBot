exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isOwner = require('../../util/isOwner');
        let ownerBool = await isOwner(client, interaction.user);
        if (!ownerBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        await interaction.deferReply({ ephemeral: true });

        // Split off command
        let textMessage = interaction.options.getString("input");
        let userIDArg = interaction.options.getString("user-id");
        let channelIDArg = interaction.options.getString("channel-id");
        let attachmentArg = interaction.options.getAttachment("attachment");
        let attachment = null;
        if (attachmentArg) attachment = attachmentArg.url;

        let target;
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
        let targetFormat = `**${target.name}** (${target.id}) in **${target.guild.name}** (${target.guild.id})`;
        if (userIDArg) targetFormat = `**${target.username}** (${target.id})`;

        try {
            let messageObject = { content: textMessage };
            if (attachment) messageObject["files"] = [attachment];
            await target.send(messageObject);
            return sendMessage({ client: client, interaction: interaction, content: `Message succesfully sent to ${targetFormat}.` });
        } catch (e) {
            // console.log(e);
            return sendMessage({ client: client, interaction: interaction, content: `Failed to message ${targetFormat}` });
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
        type: "STRING",
        description: "Message text.",
        required: true
    }, {
        name: "user-id",
        type: "STRING",
        description: "Specify user by ID."
    }, {
        name: "channel-id",
        type: "STRING",
        description: "Specify channel by ID."
    }, {
        name: "attachment",
        type: "ATTACHMENT",
        description: "Message attachment."
    }]
};
