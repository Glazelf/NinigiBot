module.exports = async (client, message) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");

        if (!message || !message.guild || !message.author || message.author.bot || message.author.system) return;

        const { LogChannels, StarboardMessages } = require('../database/dbServices/server.api');

        let messageDB = await StarboardMessages.findOne({ where: { channel_id: message.channel.id, message_id: message.id } });
        if (messageDB) {
            let starboardChannel = await client.channels.fetch(messageDB.starboard_channel_id);
            if (starboardChannel) {
                let starboardMessage = await starboardChannel.messages.fetch(messageDB.starboard_message_id);
                if (starboardMessage) starboardMessage.delete();
            };
        };

        let executor = null;
        try {
            const fetchedLogs = await message.guild.fetchAuditLogs({
                limit: 1,
                type: 'MESSAGE_DELETE',
            });
            let deleteLog = fetchedLogs.entries.first();
            if (deleteLog) {
                executor = deleteLog.executor;
                // Date.now() - 5000 is to make sure log is <5 seconds ago
                if (deleteLog.extra.channel != message.channel || deleteLog.target.id != message.member.id || deleteLog.createdTimestamp < (Date.now() - 5000)) executor = null;
            };
        } catch (e) {
            // console.log(e);
            executor = null;
        };

        // Get log
        let logChannel = await LogChannels.findOne({ where: { server_id: message.guild.id } });
        if (!logChannel) return;
        let log = message.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        // Check message content
        let botMember = message.guild.members.me;
        if (log.permissionsFor(botMember).has("SEND_MESSAGES") && log.permissionsFor(botMember).has("EMBED_LINKS")) {
            if (!message || !message.author) return;
            if (message.channel == log && message.author == client.user) return;

            let messageContent = message.content;
            if (messageContent.length > 1024) messageContent = `${messageContent.substring(0, 1021)}...`;
            if (messageContent.length < 1) return;

            let isReply = false;
            let replyMessage
            if (message.reference) isReply = true;

            if (isReply) {
                try {
                    replyMessage = await message.channel.messages.fetch(message.reference.messageId);
                } catch (e) {
                    isReply = false;
                };
            };

            let avatar;
            if (message.member) {
                avatar = message.member.displayAvatarURL(globalVars.displayAvatarSettings);
            } else {
                avatar = message.author.displayAvatarURL(globalVars.displayAvatarSettings);
            };

            const deleteEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor({ name: `Message Deleted ❌`, iconURL: avatar })
                .setDescription(`Message sent by ${message.author} (${message.author.id}) deleted from ${message.channel}.`)
                .addField(`Content:`, messageContent, false);
            if (isReply && replyMessage && replyMessage.author) deleteEmbed.addField(`Replying to:`, `"${replyMessage.content}"\n-${replyMessage.author} (${replyMessage.author.id})`);
            if (executor) deleteEmbed.addField('Executor:', `${executor} (${executor.id})`, true)
            deleteEmbed
                .setFooter({ text: message.author.username })
                .setTimestamp(message.createdTimestamp);

            return log.send({ embeds: [deleteEmbed] });
        } else if (log.permissionsFor(botMember).has("SEND_MESSAGES") && !log.permissionsFor(botMember).has("EMBED_LINKS")) {
            try {
                return log.send({ content: `I lack permissions to send embeds in your log channel.` });
            } catch (e) {
                // console.log(e);
                return;
            };
        } else {
            return;
        };

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};