module.exports = async (client, message) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('./ready');
    try {
        const getLanguageString = require('../util/getLanguageString');
        const Discord = require("discord.js");

        if (!message.guild) return;

        const { LogChannels, StarboardMessages, Languages } = require('../database/dbObjects');

        let messageDB = await StarboardMessages.findOne({ where: { channel_id: message.channel.id, message_id: message.id } });
        if (messageDB) {
            let starboardMessage = client.channels.cache.get(messageDB.starboard_channel_id).messages.cache.fetch(messageDB.starboard_message_id);
            if (starboardMessage) starboardMessage.delete();
        };

        let executor;
        try {
            const fetchedLogs = await message.guild.fetchAuditLogs({
                limit: 1,
                type: 'MESSAGE_DELETE',
            });
            let deleteLog = fetchedLogs.entries.first();
            if (deleteLog) executor = deleteLog.executor;
            if (deleteLog.extra.channel != message.channel || executor.target.id != message.member.id) executor = null
        } catch (e) {
            // console.log(e);
            if (e.toString().includes("Missing Permissions")) executor = null;
        };

        // Get log
        let logChannel = await LogChannels.findOne({ where: { server_id: message.guild.id } });
        if (!logChannel) return;
        let log = message.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        let dbLanguage = await Languages.findOne({ where: { server_id: message.guild.id } });
        let language = globalVars.language;
        if (dbLanguage) language = dbLanguage.language;

        // Check message content
        let botMember = await message.guild.members.fetch(client.user.id);
        if (log.permissionsFor(botMember).has("SEND_MESSAGES") && log.permissionsFor(botMember).has("EMBED_LINKS")) {
            if (!message || !message.author) return;
            if (message.channel == log && message.author == client.user) return;

            let messageContent = message.content;
            if (messageContent.length > 1024) messageContent = `${messageContent.substring(0, 1020)}...`;
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

            let avatar = message.member.displayAvatarURL(globalVars.displayAvatarSettings);

            let messageDeleteEventTitle = await getLanguageString(client, message, 'messageDeleteEventTitle');
            let messageDeleteEventData = await getLanguageString(client, message, 'messageDeleteEventData');
            messageDeleteEventData = messageDeleteEventData.replace('[user]', `${message.author} (${message.author.id})`).replace('[channel]', message.channel);
            let messageContentTitle = await getLanguageString(client, language, 'messageContentTitle');
            let messageReplyTitle = await getLanguageString(client, language, 'messageReplyTitle');
            let executorTitle = await getLanguageString(client, language, 'executorTitle');

            const deleteEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor(`${messageDeleteEventTitle} ❌`, avatar)
                .setDescription(messageDeleteEventData)
                .addField(messageContentTitle, messageContent, false);
            if (isReply) deleteEmbed.addField(messageReplyTitle, `"${replyMessage.content}"\n-${replyMessage.author} (${replyMessage.author.id})`);
            if (executor) deleteEmbed.addField(executorTitle, `${executor} (${executor.id})`, true)
            deleteEmbed
                .setFooter(message.author.tag)
                .setTimestamp(message.createdTimestamp);

            return log.send({ embeds: [deleteEmbed] });
        } else if (log.permissionsFor(botMember).has("SEND_MESSAGES") && !log.permissionsFor(botMember).has("EMBED_LINKS")) {
            let logBotPermissionError = await getLanguageString(client, language, 'logBotPermissionError');
            return log.send({ content: logBotPermissionError });
        } else {
            return;
        };

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};