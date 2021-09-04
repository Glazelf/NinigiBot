module.exports = async (client, messageReaction) => {
    // Import globals
    let globalVars = require('./ready');
    try {
        const getLanguageString = require('../util/getLanguageString');
        const Discord = require("discord.js");
        const { StarboardChannels, StarboardMessages, Languages } = require('../database/dbObjects');

        if (!messageReaction.count) return;

        let targetMessage = await messageReaction.message.channel.messages.fetch(messageReaction.message.id);
        let starboardChannel = await StarboardChannels.findOne({ where: { server_id: targetMessage.guild.id } });
        let messageDB = await StarboardMessages.findOne({ where: { channel_id: targetMessage.channel.id, message_id: targetMessage.id } });

        let dbLanguage = await Languages.findOne({ where: { server_id: guildBan.guild.id } });
        let language = globalVars.language;
        if (dbLanguage) language = dbLanguage.language;

        if (!starboardChannel) return;
        let starboard = await targetMessage.guild.channels.cache.find(channel => channel.id == starboardChannel.channel_id);
        if (!starboard) return;
        if (targetMessage.channel == starboard) return;
        if (messageReaction.emoji.name !== "⭐") return;

        // Call image
        let messageImage = null;
        if (targetMessage.attachments.size > 0) messageImage = await targetMessage.attachments.first().url;

        let avatar = targetMessage.author.displayAvatarURL({ format: "png", dynamic: true });
        let isReply = false;
        if (targetMessage.reference) isReply = true;

        if (isReply) {
            try {
                let ReplyChannel = await client.channels.cache.get(targetMessage.reference.channelID);
                if (!ReplyChannel) ReplyChannel = await client.channels.fetch(targetMessage.reference.channelID);
                var ReplyMessage = await ReplyChannel.messages.fetch(targetMessage.reference.messageID);
            } catch (e) {
                isReply = false;
            };
        };

        let starboardMessageSentTitle = await getLanguageString(client, language, 'starboardMessageSentTitle');
        let starboardMessageSentData = await getLanguageString(client, language, 'starboardMessageSentData');
        starboardMessageSentData = starboardMessageSentData.replace('[member]', targetMessage.author).replace('[channel]', targetMessage.channel);
        let starboardMessageContextTitle = await getLanguageString(client, language, 'starboardMessageContextTitle');
        let linkString = await getLanguageString(client, language, 'linkString');
        let messageReplyTitle = await getLanguageString(client, language, 'messageReplyTitle');

        const starEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(`⭐${messageReaction.count}`, avatar)
            .setDescription(targetMessage.content)
            .addField(starboardMessageSentTitle, starboardMessageSentData, false);
        if (isReply) starEmbed.addField(messageReplyTitle, `"${ReplyMessage.content}"\n-${ReplyMessage.author}`);
        starEmbed
            .addField(starboardMessageContextTitle, `[${linkString}](${targetMessage.url})`, false)
            .setImage(messageImage)
            .setFooter(targetMessage.author.tag)
            .setTimestamp(targetMessage.createdTimestamp);

        if (messageReaction.count == 0 && messageDB) {
            // Delete
            await client.channels.cache.get(messageDB.starboard_channel_id).messages.fetch(messageDB.starboard_message_id).then(m => m.delete());
            await messageDB.destroy();
            return;
        } else if (messageDB) {
            // Update
            let starChannel = await client.channels.fetch(messageDB.starboard_channel_id);
            let starMessage = await starChannel.messages.fetch(messageDB.starboard_message_id);
            if (!starMessage) return;

            await starMessage.edit({ embeds: [starEmbed] });
            return;
        } else {
            // Ignore
            return;
        };

    } catch (e) {
        // log error
        const logger = require('../util/logger');

        logger(e, client);
    };
};
