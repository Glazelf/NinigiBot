module.exports.run = async (bot, client, message, args) => {
    var member = message.mentions.first()
    let embed = new Discord.RichEmbed()
        .setImage(member.avatarURL)
        .setColor('#7E21EF')
    message.channel.send(embed)
};

module.exports.help = {
    name: "Avatar",
    description: "Shows a user's avatar.",
    usage: `avatar [@user]`
};
