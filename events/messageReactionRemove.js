module.exports = async (client, messageReaction) => {
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");
        const { StarboardChannels, StarboardMessages } = require('../database/dbObjects');

        let targetMessage = await client.channels.cache.get(messageReaction.message.channel.id).messages.fetch(messageReaction.message.id);
        let starboardChannel = await StarboardChannels.findOne({ where: { server_id: targetMessage.guild.id } });
        let messageDB = await StarboardMessages.findOne({ where: { channel_id: targetMessage.channel.id, message_id: targetMessage.id } });

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

        const starEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(`⭐${messageReaction.count}`, avatar)
            .setDescription(targetMessage.content)
            .addField(`Sent:`, `By ${targetMessage.author} in ${targetMessage.channel}`, false);
        if (isReply) starEmbed.addField(`Replying to:`, `"${ReplyMessage.content}"\n-${ReplyMessage.author}`);
        starEmbed
            .addField(`Context:`, `[Link](${targetMessage.url})`, false)
            .setImage(messageImage)
            .setFooter(targetMessage.author.tag)
            .setTimestamp(targetMessage.createdTimestamp);

        if (messageReaction.count >= globalVars.starboardLimit && messageDB) {
            // Update
            client.channels.cache.get(messageDB.starboard_channel_id).messages.fetch(messageDB.starboard_message_id).then(m => m.edit(starEmbed));
            await messageDB.destroy();
            return;
        } else if (messageReaction.count == 0 && messageDB) {
            // Delete
            client.channels.cache.get(messageDB.starboard_channel_id).messages.fetch(messageDB.starboard_message_id).then(m => m.delete());
            await messageDB.destroy();
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
