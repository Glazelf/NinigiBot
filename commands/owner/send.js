exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        if (interaction.user.id !== client.config.ownerID) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });
        interaction.deferReply();

        // Split off command
        let textMessage = args.find(element => element.name == "input").value;
        let userIDArg = args.find(element => element.name == "user-id");
        let channelIDArg = args.find(element => element.name == "channel-id");
        let attachmentArg = args.find(element => element.name == "attachment");
        let userID = null;
        let channelID = null;

        let attachment = null;
        if (attachmentArg) attachment = attachmentArg.attachment.url;

        let target;
        if (userIDArg || channelIDArg) {
            try {
                if (channelID) target = await client.channels.fetch(channelID)
                if (userIDArg) target = await client.users.fetch(userID);

            } catch (e) {
                // console.log(e);
            };
        } else {
            return sendMessage({ client: client, interaction: interaction, content: `Please provide a user ID or channel ID.` });
        };
        let targetFormat = `**${target.name}** (${target.id}) in **${target.guild.name}** (${target.guild.id})`;
        if (userIDArg) targetFormat = `**${target.username}** (${target.id})`;

        if (!target) return sendMessage({ client: client, interaction: interaction, content: `I could not find a user or channel with that ID.` });

        try {
            await target.send({ content: textMessage, files: [attachment] });
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
