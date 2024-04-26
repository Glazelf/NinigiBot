module.exports = async (client, messageReaction) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");
        // const altboardChannelID = "593014621095329812";
        const altboardChannelID = "922972585992532022" // Swap to value above this for final release
        const altboardEmote = "780198211913646130";
        // Check if message has reactions and if reaction is a star
        if (!messageReaction.count) return;
        // Check if message is reacting to nostar in Shinx server
        // const isNoStar = (messageReaction.emoji.id === altboardEmote && messageReaction.message.guildId == globalVars.ShinxServerID);
        const isNoStar = (messageReaction.emoji.id === altboardEmote && messageReaction.message.guildId == "759344085420605471"); // Swap to value above this for final release
        if (messageReaction.emoji.name !== "⭐" && !isNoStar) return;
        // Try to fetch message
        let targetMessage = await messageReaction.message.channel.messages.fetch(messageReaction.message.id);
        if (!targetMessage) return;
        // Get channels, starboard messages and star requirements from database
        const { StarboardChannels, StarboardMessages, StarboardLimits } = require('../database/dbServices/server.api');
        // Try to find the starboard channel, won't exist if server hasn't set one
        let starboardChannel;
        let starboard;
        if (isNoStar) { // Find altboard channel
            starboard = await targetMessage.guild.channels.fetch(altboardChannelID);
        } else { // Find starboard channel
            starboardChannel = await StarboardChannels.findOne({ where: { server_id: targetMessage.guild.id } });
            starboard = await targetMessage.guild.channels.fetch(starboardChannel.channel_id);
        }
        if (!starboard) return;
        if (targetMessage.channel == starboard) return;
        // Try to find the starred message in database
        let messageDB = await StarboardMessages.findOne({ where: { channel_id: targetMessage.channel.id, message_id: targetMessage.id } });
        // Try to find the star requirement. If it doesn't exist, use the default
        let starLimit = await StarboardLimits.findOne({ where: { server_id: messageReaction.message.guild.id } });
        if (starLimit) {
            starLimit = starLimit.star_limit;
        } else {
            starLimit = globalVars.starboardLimit;
        };
        // Check for atached files
        let messageImage = null;
        let seperateFiles = null;
        if (targetMessage.attachments.size > 0) {
            messageImage = await targetMessage.attachments.first().url;
            // Videos can't be embedded unless you're X (formerly Twitter) or YouTube, so they are sent as seperate mesages
            if (messageImage.endsWith(".mp4")) seperateFiles = messageImage;
        };
        // Get user's avatar, try to use server avatar, otherwise default to global avatar
        let avatar;
        if (targetMessage.member) {
            avatar = targetMessage.member.displayAvatarURL(globalVars.displayAvatarSettings);
        } else {
            avatar = targetMessage.author.displayAvatarURL(globalVars.displayAvatarSettings);
        };
        // Check if the starred message is replying to another message
        let isReply = false;
        let replyMessage = null;
        let replyString = "";
        if (targetMessage.reference) isReply = true;
        if (isReply) {
            try {
                // Format message the starred message is replying to
                replyMessage = await targetMessage.channel.messages.fetch(targetMessage.reference.messageId);
                if (replyMessage.content.length > 0) replyString += `"${replyMessage.content.slice(0, 950)}"`;
                if (replyMessage.author) replyString += `\n-${replyMessage.author}`;
            } catch (e) {
                isReply = false;
            };
        };
        // Format the starboard embed message
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
        // Check if message already existed in database (was posted to starboard) or if star amount simply changed
        if (messageReaction.count >= starLimit && !messageDB) {
            // Send message then push data to database
            await starboard.send({ embeds: [starEmbed], components: [starButtons] }).then(async (m) => await StarboardMessages.upsert({ channel_id: targetMessage.channel.id, message_id: targetMessage.id, starboard_channel_id: m.channel.id, starboard_message_id: m.id }));
            return;
        } else if (messageDB) {
            // Update existing starboard message and database entry
            let starChannel = await client.channels.fetch(messageDB.starboard_channel_id);
            let starMessage = await starChannel.messages.fetch(messageDB.starboard_message_id);
            if (!starMessage) return;
            await starMessage.edit({ embeds: [starEmbed], components: [starButtons] });
            // Try to pin messages with double stars
            if (messageReaction.count >= starLimit * 2) starMessage.pin().catch(e => {
                // console.log(e); 
            });
            return;
        } else {
            return;
        };

    } catch (e) {
        // Log error
        logger(e, client);
    };
};
