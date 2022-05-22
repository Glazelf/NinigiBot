exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        // Either wait for slash command attachments or some other way of getting an image
        const sendMessage = require('../../util/sendMessage');
        if (interaction.user.id !== client.config.ownerID) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        let avatarArg = args.find(element => element.name == "avatar");

        let iconImg = avatarArg.attachment.url;
        let iconSize = Math.ceil(iconArg.attachment.size / 1000);
        let fileIsImg = false;
        if (iconArg.attachment.contentType.includes('image')) fileIsImg = true;

        if (!fileIsImg) return sendMessage({ client: client, interaction: interaction, content: `Please supply an image.` });

        try {
            await client.user.setAvatar(iconImg);
        } catch (e) {
            // console.log(e);
            return sendMessage({ client: client, interaction: interaction, content: `Failed to update my avatar.` });
        };

        return sendMessage({ client: client, interaction: interaction, content: `Successfully updated my avatar.` });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "setavatar",
    aliases: [],
    description: "Set Ninigi's avatar.",
    serverID: "759344085420605471",
    options: [{
        name: "avatar",
        type: "ATTACHMENT",
        description: "Image to set avatar to.",
        required: true
    }]
};