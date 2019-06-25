module.exports.run = async (bot, client, message, args) => {
    let target = message.mentions.users.first() || message.author;
    let embed = new Discord.RichEmbed()
        .setImage(target.avatarURL)
        .setColor('#7E21EF')
    message.channel.send(embed)
};

module.exports.help = {
    name: "Avatar",
    description: "Shows a user's avatar.",
    usage: `avatar [@user]`
};
