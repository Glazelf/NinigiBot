module.exports.run = async (bot, client, message, args) => {
    if (!message.author.id === client.config.ownerID) {
        return message.channel.send("This command is currently a work in progress and unavailable to you because using it might crash the bot, sorry!")
    }
    const user = message.mentions.users.first() || message.author;
    const avatarEmbed = new Discord.RichEmbed()
        .setColor('#7E21EF')
        .setAuthor(user.username)
        .setImage(user.avatarURL);
    message.channel.send(avatarEmbed);
};

module.exports.help = {
    name: "Avatar",
    description: "Shows a user's avatar.",
    usage: `avatar [@user]`
};
