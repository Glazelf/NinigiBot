module.exports = async (client, message) => {
    try {
        const Discord = require("discord.js");

        const log = message.guild.channels.cache.find(channel => channel.name === "log");
        if (!log) return;
        if (message.channel == log && message.author == client.user) return;

        // Import totals
        let globalVars = require('./ready');

        if (!message) return;
        if (!message.author) return;

        let avatar = message.author.displayAvatarURL({ format: "png", dynamic: true });

        const deleteEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(`Message deleted ❌`, avatar)
            .setDescription(`Message sent by ${message.author} (${message.author.id}) deleted from ${message.channel}.`);
        if (message.content.length > 0) deleteEmbed.addField(`Content:`, message.content, false);
        deleteEmbed
            .setFooter(message.author.tag)
            .setTimestamp(message.createdTimestamp);

        globalVars.totalLogs += 1;
        return log.send(deleteEmbed);

    } catch (e) {
        // log error
        const logger = require('../util/logger');

        logger(e, client, message);
    };
};