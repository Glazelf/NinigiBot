module.exports.run = async (client, message) => {
    try {
        if (!message.channel.permissionsFor(message.guild.me).has("ATTACH_FILES")) return message.channel.send(`> I can't send you files because I don't have permissions to attach files to my messages, ${message.author}.`);

        const Discord = require("discord.js");

        let user = message.mentions.users.first();

        if (!user) {
            const input = message.content.split(` `, 2);
            let userID = input[1];
            user = client.users.cache.get(userID);
        };

        if (!user) {
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