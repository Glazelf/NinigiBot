module.exports = async (client, interactionReaction) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");
        const { StarboardChannels, StarboardMessages, StarboardLimits } = require('../database/dbObjects');

        if (!messageReaction.count) return;

        let targetMessage = await messageReaction.message.channel.messages.fetch(messageReaction.message.id);
        let starboardChannel = await StarboardChannels.findOne({ where: { server_id: targetMessage.guild.id } });
        let messageDB = await StarboardMessages.findOne({ where: { channel_id: targetMessage.channel.id, message_id: targetMessage.id } });
        let starLimit = await StarboardLimits.findOne({ where: { server_id: messageReaction.message.guild.id } });
        if (starLimit) {
            starLimit = starLimit.star_limit;
        } else {
            starLimit = globalVars.starboardLimit;
        };

        if (!starboardChannel) return;
        let starboard = await targetMessage.guild.channels.cache.find(channel => channel.id == starboardChannel.channel_id);
        if (!starboard) return;
        if (targetMessage.channel == starboard) return;
        if (messageReaction.emoji.name !== "⭐") return;

        // Call image
        let messageImage = null;
        if (targetMessage.attachments.size > 0) messageImage = await targetMessage.attachments.first().url;

        let avatar;
        if (targetMessage.member) {
            avatar = targetMessage.member.displayAvatarURL(globalVars.displayAvatarSettings);
        } else {
            avatar = targetMessage.author.displayAvatarURL(globalVars.displayAvatarSettings);
        };

        let isReply = false;
        let replyMessage
        if (targetMessage.reference) isReply = true;

        if (isReply) {
            try {
                replyMessage = await targetMessage.channel.messages.fetch(targetMessage.reference.messageId);
            } catch (e) {
                isReply = false;
            };
        };

        // Buttons
        let starButtons = new Discord.MessageActionRow()
            .addComponents(new Discord.MessageButton({ label: 'Context', style: 'LINK', url: `discord://-/channels/${targetMessage.guild.id}/${targetMessage.channel.id}/${targetMessage.id}` }));

        const starEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor({ name: `⭐${messageReaction.count}`, iconURL: avatar })
            .setDescription(targetMessage.content)
            .addField(`Sent:`, `By ${targetMessage.author} in ${targetMessage.channel}`, false);
        if (isReply && replyMessage) starEmbed.addField(`Replying to:`, `"${replyMessage.content}"\n-${replyMessage.author}`);
        starEmbed
            .setImage(messageImage)
            .setFooter(targetMessage.author.tag)
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
