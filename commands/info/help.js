const Discord = require("discord.js");
exports.run = async (client, message) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');

        let user = message.member.user;
        let botAvatar = client.user.displayAvatarURL(globalVars.displayAvatarSettings);

        // Structure lazy help embed with mostly just links lol
        const helpEmbed = new Discord.Embed()
            .setColor(globalVars.embedColor)
            .setAuthor({ name: `Help has arrived!`, iconURL: botAvatar })
            .addField("Wiki:", `[List](https://github.com/Glazelf/NinigiBot/wiki 'Wiki')`, false)
            .addField("Bot Invite:", `[Invite](https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=8 'Bot Invite')`, true)
            .addField("Server Invite:", `[Invite](https://discord.gg/2gkybyu 'Server Invite')`, true)
            .setFooter({ text: user.tag })
            .setTimestamp();

        return sendMessage({ client: client, message: message, embeds: helpEmbed });

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "help",
    aliases: [],
    description: "Sends information to guide bot usage."
};