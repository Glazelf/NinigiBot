module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {
        if (!message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")) return message.channel.send(`> I can't run this command because I don't have permissions to send embedded messages, ${message.author}.`);

        const Discord = require("discord.js");

        const helpEmbed = new Discord.MessageEmbed()
            .setColor("#219DCD")
            .setAuthor(`Help`, client.user.avatarURL())
            .addField("Commands:", `[Link](https://github.com/Glazelf/NinigiBot/wiki/Commands 'Commands')`, false)
            .addField("Features:", `[Link](https://github.com/Glazelf/NinigiBot/wiki/Features 'Features')`, false)
            .addField("Home Discord:", `[Link](https://discord.gg/2gkybyu 'Discord Invite')`, false)
            .setFooter(`Requested by ${message.author.tag}`)
            .setTimestamp();

        return message.channel.send(helpEmbed);

    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${globalVars.prefix}info.`);
    };
};