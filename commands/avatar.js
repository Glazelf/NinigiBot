module.exports.run = async (bot, client, message, args) => {
    var user = message.mentions.users.first();
    let embed = new Discord.RichEmbed()
        .setImage(user.avatarURL)
        .setColor('#7E21EF')
    message.channel.send(embed)
};

module.exports.help = {
    name: "Avatar",
    description: "Shows a user's avatar.",
    usage: `avatar [@user]`
};
