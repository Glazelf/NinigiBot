module.exports.run = async (client, message) => {
    try {
        if (!message.channel.permissionsFor(message.guild.me).has("ATTACH_FILES")) return message.channel.send(`> I can't send you files because I don't have permissions to attach files to my messages, <@${message.author.id}>.`);

        const Discord = require("discord.js");

        let user = message.mentions.users.first();

        if (!user) {
            let userID = message.content.slice(8);
            user = client.users.cache.get(userID);
        };

        if (!user) {
            user = message.author;
        };

        let userCache = client.users.cache.get(user.id);
        let totalMessage = `Here you go, ${message.author}, ${user.tag}'s avatar.`;
        
        // let avatarWebp = userCache.avatarURL();
        // let splitAvatar = avatarWebp.split(`.webp`, 1);
        // let avatarPNG = `${splitAvatar[0]}.png`;
        
        return message.channel.send(totalMessage, {
            files: [userCache.avatarURL()]
        });

} catch (e) {
    // log error
    console.log(e);

    // return confirmation
    return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
};
};

module.exports.help = {
name: "avatar",
description: "Sends you the target's profile picture as a file.",
usage: "avatar [either tagging the target or their userID]"
};