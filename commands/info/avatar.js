module.exports.run = async (client, message, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require('discord.js');

        let user;
        let member;
        if (message.mentions) {
            user = message.mentions.users.first();
            member = message.mentions.members.first();
        };

        if (!user && args[0]) {
            let userID = args[0];
            user = client.users.cache.get(userID);
            member = message.guild.members.cache.get(userID);
        };

        if (!user || !member) {
            user = message.member.user;
        };

        let avatar = null;
        if (user.avatarURL()) avatar = user.avatarURL({ format: "png", dynamic: true });
        if (!avatar) return sendMessage(client, message, `${user.tag} doesn't have an avatar.`);

        const avatarEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(`${user.username}'s avatar`)
            .setImage(avatar)
            .setFooter(message.member.user.tag)
            .setTimestamp();

        return sendMessage(client, message, null, avatarEmbed);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "avatar",
    aliases: ["avi", "pfp"],
    description: "Sends a user's avatar.",
    options: [{
        name: "user-mention",
        type: "MENTIONABLE",
        description: "Specify user by mention."
    }, {
        name: "user-id",
        type: "STRING",
        description: "Specify user by ID."
    }]
};