exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        if (interaction.member.id !== client.config.ownerID) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        if (!args[1]) return sendMessage({ client: client, interaction: interaction, content: `You need to provide a message to send.` });

        // Split off command
        let textMessage = args.find(element => element.name == "input").value;
        let userID = args.find(element => element.name == "user-id").value;
        let attachmentArg = args.find(element => element.name == "attachment");
        let attachment = null;
        if (attachmentArg) attachment = attachmentArg.attachment.url;

        let targetUser;
        try {
            targetUser = await client.users.fetch(userID);
        } catch (e) {
            // console.log(e);
        };

        if (!targetUser) return sendMessage({ client: client, interaction: interaction, content: `I could not find a user with that ID. Possible reasons are that no such user exists, I don't share a server with them or their DMs are closed.` });

        try {
            await targetUser.send({ content: textMessage, files: [attachment] });
            return sendMessage({ client: client, interaction: interaction, content: `Message succesfully sent to **${targetUser.tag}** (${targetUser.id}).` });
        } catch (e) {
            // console.log(e);
            return sendMessage({ client: client, interaction: interaction, content: `Failed to message **${targetUser.tag}**. They probably have their DMs closed.` });
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "dm",
    description: "DMs a user.",
    serverID: "759344085420605471",
    options: [{
        name: "user-id",
        type: "STRING",
        description: "Specify user by ID.",
        required: true
    }, {
        name: "input",
        type: "STRING",
        description: "Text message to DM.",
        required: true
    }, {
        name: "attachment",
        type: "ATTACHMENT",
        description: "Message attachment"
    }]
};
