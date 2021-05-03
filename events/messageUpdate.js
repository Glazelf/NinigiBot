const { update } = require("lodash");

module.exports = async (client, message, newMessage) => {
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");

        if (!message.guild) return;

        const { LogChannels } = require('../database/dbObjects');
        let logChannel = await LogChannels.findOne({ where: { server_id: message.guild.id } });
        if (!logChannel) return;
        let log = message.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        if (!message) return;
        if (!message.author) return;
        if (message.content === newMessage.content) return;
        if (!message.content || !newMessage.content) return;

        let messageContent = message.content;
        let newMessageContent = newMessage.content
        if (messageContent.length > 1024) messageContent = `${messageContent.substring(0, 1020)}...`;
        if (newMessageContent.length > 1024) newMessageContent = `${newMessageContent.substring(0, 1020)}...`;

        let isReply = false;
        if (message.reference) isReply = true;

        if (isReply) {
            try {
                let ReplyChannel = await client.channels.cache.get(message.reference.channelID);
                if (!ReplyChannel) ReplyChannel = await client.channels.fetch(message.reference.channelID);
                var ReplyMessage = await ReplyChannel.messages.fetch(message.reference.messageID);
            } catch (e) {
                isReply = false;
            };
        };

        let messageImage = null;
        if (message.attachments.size > 0) messageImage = message.attachments.first().url;

        let avatar = message.author.displayAvatarURL({ format: "png", dynamic: true });

        const updateEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(`Message edited ⚒️`, avatar)
            .setDescription(`Message sent by ${message.author} (${message.author.id}) edited in ${message.channel}.`);
        if (messageContent.length > 0) updateEmbed.addField(`Before:`, messageContent, false);
        updateEmbed
            .addField(`After:`, newMessageContent, false)
        if (isReply) updateEmbed.addField(`Replying to:`, `"${ReplyMessage.content}"\n-${ReplyMessage.author}`);
        updateEmbed
            .addField(`Jump to message:`, `[Link](${message.url})`, false)
            .setImage(messageImage)
            .setFooter(message.author.tag)
            .setTimestamp(message.createdTimestamp);

        return log.send(updateEmbed);

    } catch (e) {
        // log error
        const logger = require('../util/logger');

        logger(e, client, message);
    };
};