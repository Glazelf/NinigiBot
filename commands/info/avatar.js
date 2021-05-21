const sendMessage = require('../../util/sendMessage');

module.exports.run = async (client, message) => {
    try {
        const sendMessage = require('../../util/sendMessage');
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

        let totalMessage = `${user.tag}'s avatar.`;

        let avatar = null;
        if (user.avatarURL()) avatar = user.avatarURL({ format: "png", dynamic: true });
        if (!avatar) return sendMessage(client, message, `${user.tag} doesn't have an avatar.`);

        return sendMessage(client, message, totalMessage, true, [avatar]);

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