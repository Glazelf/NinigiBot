module.exports.run = async (client, message, args = []) => {
    try {
        const sendMessage = require('../../util/sendMessage');

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

        let totalMessage = `${user.tag}'s avatar.`;

        let avatar = null;
        if (user.avatarURL()) avatar = user.avatarURL({ format: "png", dynamic: true });
        if (!avatar) return sendMessage(client, message, `${user.tag} doesn't have an avatar.`);

        return sendMessage(client, message, totalMessage, null, avatar);

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