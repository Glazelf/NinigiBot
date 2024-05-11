const Discord = require("discord.js");
exports.run = async (client, interaction, logger) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const isOwner = require('../../util/isOwner');
        let ownerBool = await isOwner(client, interaction.user);
        if (!ownerBool) return sendMessage({ client: client, interaction: interaction, content: client.globalVars.lackPerms });

        let ephemeral = true;
        await interaction.deferReply({ ephemeral: ephemeral });

        let avatarArg = interaction.options.getAttachment("avatar");
        let iconImg = avatarArg.url;
        let iconSize = Math.ceil(avatarArg.size / 1000);
        let fileIsImg = false;
        if (avatarArg.contentType.includes('image')) fileIsImg = true;

        if (!fileIsImg) return sendMessage({ client: client, interaction: interaction, content: `Please supply an image.` });
        try {
            await client.user.setAvatar(iconImg);
        } catch (e) {
            // console.log(e);
            return sendMessage({ client: client, interaction: interaction, content: `Failed to update my avatar.` });
        };
        return sendMessage({ client: client, interaction: interaction, content: `Updated my avatar.` });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "setavatar",
    aliases: [],
    description: "Set Ninigi's avatar.",
    serverID: ["759344085420605471"],
    options: [{
        name: "avatar",
        type: Discord.ApplicationCommandOptionType.Attachment,
        description: "Image to set avatar to.",
        required: true
    }]
};