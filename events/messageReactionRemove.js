module.exports = async (client, messageReaction) => {
    const logger = require('../util/logger');
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

        let dbLanguage = await Languages.findOne({ where: { server_id: messageReaction.message.guild.id } });
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

        let avatar = targetMessage.member.displayAvatarURL(globalVars.displayAvatarSettings);
        let isReply = false;
        let replyMessage;
        if (targetMessage.reference) isReply = true;

        if (isReply) {
            try {
                replyMessage = await targetMessage.channel.messages.fetch(targetMessage.reference.messageId);
            } catch (e) {
                isReply = false;
            };
        };

        let starboardMessageSentTitle = await getLanguageString(client, language, 'starboardMessageSentTitle');
        let starboardMessageSentData = await getLanguageString(client, language, 'starboardMessageSentData');
        starboardMessageSentData = starboardMessageSentData.replace('[member]', targetMessage.author).replace('[channel]', targetMessage.channel);
        let starboardMessageContextTitle = await getLanguageString(client, language, 'starboardMessageContextTitle');
        let messageReplyTitle = await getLanguageString(client, language, 'messageReplyTitle');

        // Buttons
        let starButtons = new Discord.MessageActionRow()
            .addComponents(new Discord.MessageButton({ label: starboardMessageContextTitle, style: 'LINK', url: `discord://-/channels/${targetMessage.guild.id}/${targetMessage.channel.id}/${targetMessage.id}` }));

        const starEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(`⭐${messageReaction.count}`, avatar)
            .setDescription(targetMessage.content)
            .addField(starboardMessageSentTitle, starboardMessageSentData, false);
        if (isReply) starEmbed.addField(messageReplyTitle, `"${replyMessage.content}"\n-${replyMessage.author}`);
        starEmbed
            .setImage(messageImage)
            .setFooter(targetMessage.author.tag)
            .setTimestamp(targetMessage.createdTimestamp);

        if (messageReaction.count == 0 && messageDB) {
            // Delete
            await client.channels.fetch(messageDB.starboard_channel_id).messages.fetch(messageDB.starboard_message_id).then(m => m.delete());
            await messageDB.destroy();
            return;
        } else if (messageDB) {
            // Update
            let starChannel = await client.channels.fetch(messageDB.starboard_channel_id);
            let starMessage = await starChannel.messages.fetch(messageDB.starboard_message_id);
            if (!starMessage) return;

            await starMessage.edit({ embeds: [starEmbed], components: [starButtons] });
            return;
        } else {
            // Ignore
            return;
        };

    } catch (e) {
        // Log error
        logger(e, client);
    };
};
