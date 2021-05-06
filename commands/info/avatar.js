module.exports.run = async (client, message) => {
    try {

        const Discord = require("discord.js");

        let user = message.mentions.users.first();
        let member = message.mentions.members.first();

        if (!user) {
            const input = message.content.split(` `, 2);
            let userID = input[1];
            user = client.users.cache.get(userID);
            member = message.guild.members.cache.get(userID);
        };

        if (!user || !member) {
            user = message.author;
        };

        let totalMessage = `> Here you go, ${message.author}, ${user.tag}'s avatar.`;

        let avatar = null;
        if (user.avatarURL()) avatar = user.avatarURL({ format: "png", dynamic: true });
        if (!avatar) return message.channel.send(`> ${user.tag} doesn't have an avatar, ${message.author}.`);

        return message.channel.send(totalMessage, {
            files: [avatar]
        });

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "avatar",
    aliases: ["avi", "pfp"]
};