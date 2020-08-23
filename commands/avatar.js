module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../events/ready');
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

        let userCache = client.users.cache.get(user.id);
        let totalMessage = `Here you go, ${message.author}, ${user.tag}'s avatar.`;

        let avatar = null;
        if (userCache.avatarURL()) avatar = userCache.avatarURL({ format: "png", dynamic: true });

        return message.channel.send(totalMessage, {
            files: [avatar]
        });

    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${globalVars.prefix}info.`);
    };
};
