module.exports = async (client, message) => {
    try {
        const Discord = require("discord.js");

        const log = message.guild.channels.cache.find(channel => channel.name === "log");
        if (!log) return;

        // Import totals
        let globalVars = require('./ready');

        if (!message) return;
        if (!message.author) return;
        if (!message.content) {
            message.content = "None";
        };

        let avatar = null;
        if (message.author.avatarURL()) avatar = message.author.avatarURL({ format: "png", dynamic: true });

        const deleteEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(`Message deleted ❌`, avatar)
            .setDescription(`Message sent by ${message.author} deleted from ${message.channel}.`)
            .addField(`Content:`, message.content, false)
            .setTimestamp();

        globalVars.totalLogs += 1;
        return log.send(deleteEmbed);

    } catch (e) {
        // log error
        let { logger } = require('./ready');
        logger(e);
    };
};
