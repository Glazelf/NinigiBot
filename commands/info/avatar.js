const Discord = require("discord.js");
exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');

        // Get user
        let user;
        if (message.mentions && (message.mentions.members.size > 0 || message.mentions.repliedUser)) {
            user = message.mentions.users.first();
        };

        if (!user && args[0]) {
            let userID = args[0];
            try {
                user = await client.users.fetch(userID);
            } catch (e) {
                // console.log(e);
            };
        };

        if (!user) user = message.member.user;

        let member;
        try {
            member = await message.guild.members.fetch(user.id);
        } catch (e) {
            // console.log(e);
            return sendMessage({ client: client, message: message, content: `No member information could be found for this user.` });
        };

        // Get avatar
        let avatar = null;
        let serverAvatar = null;
        if (user.avatarURL()) avatar = await user.avatarURL({ format: "png", dynamic: true, size: 512 });
        if (member.avatarURL()) serverAvatar = await member.avatarURL(globalVars.displayAvatarSettings);
        if (!avatar && !serverAvatar) return sendMessage({ client: client, message: message, content: `**${user.tag}** doesn't have an avatar.` });
        if (!serverAvatar) {
            serverAvatar = avatar;
            avatar = null;
        };

        const avatarEmbed = new Discord.Embed()
            .setColor(globalVars.embedColor)
            .setThumbnail(avatar)
            .setAuthor({ name: `${user.username}'s avatar(s):` })
            .setImage(serverAvatar)
            .setFooter({ text: user.tag })
            .setTimestamp();

        return sendMessage({ client: client, message: message, embeds: avatarEmbed });

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "Avatar",
    type: Discord.ApplicationCommandOptionType.User,
    aliases: ["avi", "pfp"]
};