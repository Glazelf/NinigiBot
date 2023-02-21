exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require('discord.js');
        let user = interaction.options.getUser("user");
        let member = interaction.options.getMember("user");
        // Get avatars
        let avatar = null;
        let serverAvatar = null;
        if (user.avatarURL()) avatar = await user.avatarURL(globalVars.displayAvatarSettings);
        if (member && member.avatarURL()) serverAvatar = await member.avatarURL(globalVars.displayAvatarSettings);
        if (!avatar && !serverAvatar) return sendMessage({ client: client, interaction: interaction, content: `${user.tag} doesn't have an avatar.` });
        if (!serverAvatar) {
            serverAvatar = avatar;
            avatar = null;
        };
        const avatarEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setThumbnail(avatar)
            .setAuthor({ name: `${user.username}'s avatar(s):` })
            .setImage(serverAvatar);
        return sendMessage({ client: client, interaction: interaction, embeds: avatarEmbed });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "Avatar",
    type: "USER"
};