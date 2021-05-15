module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const Discord = require("discord.js");

        const helpEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(`Help has arrived!`, client.user.displayAvatarURL({ format: "png", dynamic: true }))
            .addField("Commands:", `[List](https://github.com/Glazelf/NinigiBot/wiki/Commands 'Commands List')`, false)
            .addField("Shinxmon:", `[Guide](https://github.com/Glazelf/NinigiBot/wiki/Shinxmon 'Shinxmon Guide')`, false)
            .addField("Support:", `[Paypal](https://paypal.me/glazelf 'Paypal')
[Github](https://github.com/sponsors/Glazelf)
[Patreon](https://patreon.com/glazelf 'Patreon')
[Ko-fi](https://ko-fi.com/glaze0388 'Ko-fi')`, false)
            .addField("Bot Invite:", `[Invite](https://discordapp.com/oauth2/authorize?client_id=592760951103684618&scope=bot&permissions=8 'Bot Invite')`, true)
            .addField("Server Invite:", `[Invite](https://discord.gg/2gkybyu 'Server Invite')`, true)
            .setFooter(message.author.tag)
            .setTimestamp();

        return message.reply(helpEmbed);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "help",
    aliases: [],
    description: "Sends information to guide bot usage."
};