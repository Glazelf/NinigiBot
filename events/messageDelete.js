module.exports = async (client, message) => {
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");

        const { LogChannels } = require('../database/dbObjects');
        let logChannel = await LogChannels.findOne({ where: { server_id: message.guild.id } });
        if (!logChannel) return;
        let log = message.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;
        if (message.channel == log && message.author == client.user) return;

        if (!message) return;
        if (!message.author) return;

        let messageContent = message.content;
        if (messageContent.length > 1024) messageContent = `${messageContent.substring(0, 1020)}...`;

        let avatar = message.author.displayAvatarURL({ format: "png", dynamic: true });

        const deleteEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(`Message deleted ❌`, avatar)
            .setDescription(`Message sent by ${message.author} (${message.author.id}) deleted from ${message.channel}.`);
        if (messageContent.length > 0) deleteEmbed.addField(`Content:`, messageContent, false);
        deleteEmbed
            .setFooter(message.author.tag)
            .setTimestamp(message.createdTimestamp);

        return log.send(deleteEmbed);

    } catch (e) {
        // log error
        const logger = require('../util/logger');

        logger(e, client, message);
    };
};