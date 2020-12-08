module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (!message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")) return message.channel.send(`> I can't run this command because I don't have permissions to send embedded messages, ${message.author}.`);

        const Discord = require("discord.js");

        const helpEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(`Help`, client.user.displayAvatarURL({ format: "png", dynamic: true }))
            .addField("Commands:", `[List](https://github.com/Glazelf/NinigiBot/wiki/Commands 'Commands List')`, false)
            .addField("Shinxmon:", `[Guide](https://github.com/Glazelf/NinigiBot/wiki/Shinxmon 'Shinxmon Guide')`, false)
            .addField("Discord:", `[Server Invite](https://discord.gg/2gkybyu 'Server Invite')`, false)
            .setFooter(message.author.tag)
            .setTimestamp();

        return message.channel.send(helpEmbed);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "help",
    aliases: []
};