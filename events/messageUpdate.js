const { update } = require("lodash");

module.exports = async (client, message, newMessage) => {
    // Import globals
    let globalVars = require('./ready');
    try {
        const getLanguageString = require('../util/getLanguageString');
        const Discord = require("discord.js");
        const autoMod = require('../util/autoMod');

        if (!message.guild) return;

        const { LogChannels, Languages } = require('../database/dbObjects');
        let logChannel = await LogChannels.findOne({ where: { server_id: message.guild.id } });
        if (!logChannel) return;
        let log = message.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        let dbLanguage = await Languages.findOne({ where: { server_id: message.guild.id } });
        let language = globalVars.language;
        if (dbLanguage) language = dbLanguage.language;

        let botMember = await message.guild.members.fetch(client.user.id);

        if (log.permissionsFor(botMember).has("SEND_MESSAGES") && log.permissionsFor(botMember).has("EMBED_LINKS")) {
            if (!message || !message.author) return;
            if (message.content === newMessage.content) return;

            let messageImage = null;
            if (message.attachments.size > 0) messageImage = message.attachments.first().url;

            if (!messageImage && !newMessage.content) return;

            let messageContent = message.content;
            let newMessageContent = newMessage.content
            if (messageContent.length > 1024) messageContent = `${messageContent.substring(0, 1020)}...`;
            if (newMessageContent.length > 1024) newMessageContent = `${newMessageContent.substring(0, 1020)}...`;

            // Language = en as a test for now untill proper translation 
            let language = 'en';
            await autoMod(client, newMessage, language);

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

            let avatar = message.author.displayAvatarURL({ format: "png", dynamic: true });

            let messageEditEventTitle = await getLanguageString(client, language, 'messageEditEventTitle');
            let messageEditEventData = await getLanguageString(client, language, 'messageEditEventData');
            messageEditEventData = messageEditEventData.replace('[user]', `${message.author} (${message.author.id}`).replace('[channel]', message.channel);
            let updateOldTitle = await getLanguageString(client, language, 'updateOldTitle');
            let updateNewTitle = await getLanguageString(client, language, 'updateNewTitle');
            let messageReplyTitle = await getLanguageString(client, language, 'messageReplyTitle');
            let messageJumpTitle = await getLanguageString(client, language, 'messageJumpTitle');
            let linkString = await getLanguageString(client, language, 'linkString');

            const updateEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor(`${messageEditEventTitle} ⚒️`, avatar)
                .setDescription(messageEditEventData);
            if (messageContent.length > 0) updateEmbed.addField(updateOldTitle, messageContent, false);
            updateEmbed
                .addField(updateNewTitle, newMessageContent, false)
            if (isReply) updateEmbed.addField(messageReplyTitle, `"${ReplyMessage.content}"\n-${ReplyMessage.author}`);
            updateEmbed
                .addField(messageJumpTitle, `[${linkString}](${message.url})`, false)
                .setImage(messageImage)
                .setFooter(message.author.tag)
                .setTimestamp(message.createdTimestamp);

            return log.send({ embeds: [updateEmbed] });
        } else if (log.permissionsFor(botMember).has("SEND_MESSAGES") && !log.permissionsFor(botMember).has("EMBED_LINKS")) {
            let logBotPermissionError = await getLanguageString(client, language, 'logBotPermissionError');
            return log.send({ content: logBotPermissionError });
        } else {
            return;
        };

    } catch (e) {
        // log error
        const logger = require('../util/logger');

        logger(e, client, message);
    };
};