module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (!message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")) return message.channel.send(`> I can't run this command because I don't have permissions to send embedded messages, ${message.author}.`);

        const Discord = require("discord.js");

        const helpEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(`Help has arrived!`, client.user.displayAvatarURL({ format: "png", dynamic: true }))
            .addField("Bot Invite:", `[Invite](https://discordapp.com/oauth2/authorize?client_id=592760951103684618&scope=bot&permissions=8 'Bot Invite')`, true)
            .addField("Server Invite:", `[Invite](https://discord.gg/2gkybyu 'Server Invite')`, true)
            .addField("Commands:", `[List](https://github.com/Glazelf/NinigiBot/wiki/Commands 'Commands List')`, false)
            .addField("Shinxmon:", `[Guide](https://github.com/Glazelf/NinigiBot/wiki/Shinxmon 'Shinxmon Guide')`, false)
            .addField("Support:", `[Paypal](https://paypal.me/glazelf 'Paypal')
[Ko-fi](https://ko-fi.com/glaze0388 'Ko-fi')
[Patreon](https://patreon.com/glazelf 'Patreon')`, false)
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