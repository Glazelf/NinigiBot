exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require('discord.js');

        let user = args[0].user;

        let member;
        try {
            member = await interaction.guild.members.fetch(user.id);
        } catch (e) {
            // console.log(e);
            return sendMessage({ client: client, interaction: interaction, content: `No member information could be found for this user. They probably aren't in this server anymore.` });
        };

        // Get avatar
        let avatar = null;
        let serverAvatar = null;
        if (user.avatarURL()) avatar = await user.avatarURL({ format: "png", dynamic: true, size: 512 });
        if (member.avatarURL()) serverAvatar = await member.avatarURL(globalVars.displayAvatarSettings);
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