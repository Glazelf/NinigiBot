module.exports.run = async (bot, client, message, args) => {
    const Discord = require("discord.js");
    let embed = new Discord.RichEmbed()
        .setImage(message.author.displayAvatarURL)
        .setColor('#7E21EF')
    message.channel.send(embed)
};

module.exports.help = {
    name: "Avatar",
    description: "Shows a user's avatar.",
    usage: `avatar [@user]`
};
