module.exports = async (client, message, oldMessage) => {
    try {
        const Discord = require("discord.js");

        const log = message.guild.channels.cache.find(channel => channel.name === "log");

        if (!log) return;

        // Import totals
        let globalVars = require('./ready');

        if (message.content == "") return;
        if (message.content === oldMessage.content) return;

        if (!log) return;

        let messageImage = null;
        if (message.attachments.size > 0) messageImage = message.attachments.first().url;

        avatar = null;
        if (message.author.avatarURL()) avatar = message.author.avatarURL({ format: "png", dynamic: true });

        const updateEmbed = new Discord.MessageEmbed()
            .setColor("#219DCD")
            .setAuthor(`Message edited ⚒️`, avatar)
            .setDescription(`Message sent by ${message.author} edited in ${message.channel}.`)
            //Why does oldMessage return the newMessage, does newMessage not exist and does message return the old message?
            .addField(`Before:`, message.content, false)
            .addField(`After:`, oldMessage.content, false)
            .addField(`Jump to message:`, `[Link](${message.url})`, false)
            .setImage(messageImage)
            .setFooter(`Edited by ${message.author.tag} at`)
            .setTimestamp();

        globalVars.totalLogs += 1;
        return log.send(updateEmbed);

    } catch (e) {
        // log error
        console.log(e);
    };
};