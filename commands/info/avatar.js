const Discord = require("discord.js");
exports.run = async (client, interaction, logger, globalVars) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        let user = interaction.options.getUser("user");
        let member = interaction.options.getMember("user");
        // Get avatars
        let avatar = null;
        let serverAvatar = null;
        if (user.avatarURL()) avatar = await user.avatarURL(globalVars.displayAvatarSettings);
        if (member && member.avatarURL()) serverAvatar = await member.avatarURL(globalVars.displayAvatarSettings);
        if (!avatar && !serverAvatar) return sendMessage({ client: client, interaction: interaction, content: `${user.username} doesn't have an avatar.` });
        if (!serverAvatar) {
            serverAvatar = avatar;
            avatar = null;
        };
        const avatarEmbed = new Discord.EmbedBuilder()
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
    type: Discord.ApplicationCommandType.User
};