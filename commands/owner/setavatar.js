exports.run = async (client, message, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        if (message.member.id !== client.config.ownerID) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        if (message.attachments.size < 1) return sendMessage({ client: client, interaction: interaction, content: `Please supply an image.` });

        const [firstAttachment] = message.attachments.values();
        await client.user.setAvatar(firstAttachment.url);

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
    permission: "owner",
    defaultPermission: false
};