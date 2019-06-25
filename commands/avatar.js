module.exports.run = async (bot, message, args) => {
    let msg = await message.channel.send("doing some magic ...");
    let target = message.mentions.users.first() || message.author;

    await message.channel.send({
        files: [
            {
                attachment: target.displayAvatarURL,
                name: "avatar.png"
            }
        ]
    })

    msg.delete();
};

module.exports.help = {
    name: "avatar",
    description: "Shows a user's avatar.",
    usage: `${client.config.prefix}avatar [@user]`
};