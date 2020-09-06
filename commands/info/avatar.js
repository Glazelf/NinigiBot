module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
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
        let totalMessage = `> Here you go, ${message.author}, ${user.tag}'s avatar.`;

        let avatar = null;
        if (userCache.avatarURL()) avatar = userCache.avatarURL({ format: "png", dynamic: true });

        return message.channel.send(totalMessage, {
            files: [avatar]
        });

    } catch (e) {
        // log error
        console.log(e);

        // log to dev channel
        let baseMessage = `An error occurred in ${message.channel}!
\`\`\`
${e}
\`\`\``;
        if (baseMessage.length > 2000) baseMessage = baseMessage.substring(0, 1950) + `...
\`\`\``;
        let devChannel = client.channels.cache.get(client.config.devChannelID);
        devChannel.send(baseMessage);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command. The error has already been logged, but please also report this as an issue on the Github page or send a message to Glaze#6669. For links and other information use ${globalVars.prefix}info.`);
    };
};
