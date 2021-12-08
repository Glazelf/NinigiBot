exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require('discord.js');

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
            return sendMessage(client, message, `No member information could be found for this user.`);
        };

        // Get banner
        // To do: (testing) What happens if a user has no banner and/or no server banner
        let banner = null;
        let serverBanner = null;
        if (user.bannerURL()) banner = await user.bannerURL(globalVars.displayBannerSettings);
        if (member.bannerURL()) serverBanner = await member.bannerURL(globalVars.displayAvatarSettings);
        if (!banner && !serverBanner) return sendMessage(client, message, `**${user.tag}** doesn't have a banner.`);
        if (!serverBanner) {
            serverBanner = banner;
            banner = null;
        };

        const bannerEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setThumbnail(banner)
            .setAuthor({ name: `${user.username}'s banner(s):` })
            .setImage(serverBanner)
            .setFooter(user.tag)
            .setTimestamp();

        return sendMessage(client, message, null, bannerEmbed);

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "Banner",
    type: "USER",
    aliases: []
};