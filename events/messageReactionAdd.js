module.exports = async (client, messageReaction) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");
        const { StarboardChannels, StarboardMessages, StarboardLimits } = require('../database/dbServices/server.api');

        if (!messageReaction.count) return;

        let targetMessage = await messageReaction.message.channel.messages.fetch(messageReaction.message.id);
        if (!targetMessage) return;
        let starboardChannel = await StarboardChannels.findOne({ where: { server_id: targetMessage.guild.id } });
        if (!starboardChannel) return;
        let messageDB = await StarboardMessages.findOne({ where: { channel_id: targetMessage.channel.id, message_id: targetMessage.id } });
        let starLimit = await StarboardLimits.findOne({ where: { server_id: messageReaction.message.guild.id } });
        if (starLimit) {
            starLimit = starLimit.star_limit;
        } else {
            starLimit = globalVars.starboardLimit;
        };
        let starboard = await targetMessage.guild.channels.cache.find(channel => channel.id == starboardChannel.channel_id);
        if (!starboard) return;
        if (targetMessage.channel == starboard) return;
        if (messageReaction.emoji.name !== "⭐") return;
        // Attachments, messages don't send for some reason when attaching seperate files?
        let messageImage = null;
        let seperateFiles = null;
        if (targetMessage.attachments.size > 0) {
            messageImage = await targetMessage.attachments.first().url;
            if (messageImage.endsWith(".mp4")) seperateFiles = messageImage;
        };
        let avatar;
        if (targetMessage.member) {
            avatar = targetMessage.member.displayAvatarURL(globalVars.displayAvatarSettings);
        } else {
            avatar = targetMessage.author.displayAvatarURL(globalVars.displayAvatarSettings);
        };
        let isReply = false;
        let replyMessage = null;
        let replyString = "";
        if (targetMessage.reference) isReply = true;
        if (isReply) {
            try {
                replyMessage = await targetMessage.channel.messages.fetch(targetMessage.reference.messageId);
                if (replyMessage.content.length > 0) replyString += `"${replyMessage.content.slice(0, 950)}"`;
                if (replyMessage.author) replyString += `\n-${replyMessage.author}`;
            } catch (e) {
                isReply = false;
            };
        };
        let starButtons = new Discord.ActionRowBuilder()
            .addComponents(new Discord.ButtonBuilder({ label: 'Context', style: Discord.ButtonStyle.Link, url: `discord://-/channels/${targetMessage.guild.id}/${targetMessage.channel.id}/${targetMessage.id}` }));
        const starEmbed = new Discord.EmbedBuilder()
            .setColor(globalVars.embedColor)
            .setAuthor({ name: `⭐${messageReaction.count}`, iconURL: avatar });
        if (targetMessage.content) starEmbed.setDescription(targetMessage.content);
        starEmbed.addFields([{ name: `Sent:`, value: `By ${targetMessage.author} in ${targetMessage.channel}`, inline: false }]);
        if (isReply && replyString.length > 0) starEmbed.addFields([{ name: `Replying to:`, value: replyString, inline: true }]);
        starEmbed
            .setImage(messageImage)
            .setFooter({ text: targetMessage.author.username })
            .setTimestamp(targetMessage.createdTimestamp);
        if (messageReaction.count >= starLimit && !messageDB) {
            // Create
            await starboard.send({ embeds: [starEmbed], components: [starButtons] }).then(async (m) => await StarboardMessages.upsert({ channel_id: targetMessage.channel.id, message_id: targetMessage.id, starboard_channel_id: m.channel.id, starboard_message_id: m.id }));
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
