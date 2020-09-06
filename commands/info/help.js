module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (!message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")) return message.channel.send(`> I can't run this command because I don't have permissions to send embedded messages, ${message.author}.`);

        const Discord = require("discord.js");

        const helpEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(`Help`, client.user.avatarURL())
            .addField("Commands:", `[List](https://github.com/Glazelf/NinigiBot/wiki/Commands 'Commands List')`, false)
            .addField("Shinxmon", `[Guide](https://github.com/Glazelf/NinigiBot/wiki/Shinxmon 'Shinxmon Guide')`, false)
            .addField("Discord:", `[Server Invite](https://discord.gg/2gkybyu 'Server Invite')`, false)
            .setFooter(`Requested by ${message.author.tag}`)
            .setTimestamp();

        return message.channel.send(helpEmbed);

    } catch (e) {
        // log error
        console.log(e);

        // log to dev channel
        let baseMessage = `An error occurred in ${message.channel}!
\`\`\`
${e}
\`\`\``;
        if (baseMessage.length > 2000) baseMessage = baseMessage.substring(0, 1950) + `...
\`\`\``;
        let devChannel = client.channels.cache.get(client.config.devChannelID);
        devChannel.send(baseMessage);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command. The error has already been logged, but please also report this as an issue on the Github page or send a message to Glaze#6669. For links and other information use ${globalVars.prefix}info.`);
    };
};