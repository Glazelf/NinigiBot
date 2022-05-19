exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        // Either wait for slash command attachments or some other way of getting an image
        const sendMessage = require('../../util/sendMessage');
        if (interaction.member.id !== client.config.ownerID) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        if (interaction.attachments.size < 1) return sendMessage({ client: client, interaction: interaction, content: `Please supply an image.` });

        const [firstAttachment] = interaction.attachments.values();
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
    serverID: "759344085420605471"
};