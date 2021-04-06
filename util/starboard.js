module.exports = async (message, client) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {
        const Discord = require("discord.js");
        const { StarboardChannels } = require('../database/dbObjects');

        // Call image
        let messageImage = null;
        let messageVideo = null;
        if (message.attachments.size > 0) {
            messageImage = message.attachments.first().url;
            if (messageImage.endsWith(".mp4")) {
                messageVideo = messageImage;
                messageImage = null;
            };
        };

        if (message.reference) {
            let ReplyChannel = await client.channels.cache.get(message.reference.channelID);
            var ReplyMessage = await ReplyChannel.messages.fetch(message.reference.messageID);
        };

        // Starboard logic
        message.awaitReactions(reaction => reaction.emoji.name == "⭐", { max: globalVars.starboardLimit, time: 3600000 }).then(async collected => {
            let starboardChannel = await StarboardChannels.findOne({ where: { server_id: message.guild.id } });
            // Check various permissions and channel existences
            if (starboardChannel) {
                let starboard = message.guild.channels.cache.find(channel => channel.id == starboardChannel.channel_id);
                if (starboard) {
                    if (message.channel !== starboard) {
                        if (!starboard.permissionsFor(message.guild.me).has("EMBED_LINKS")) return message.channel.send(`> I don't have permissions to send embedded message to your starboard, ${message.author}.`);
                        if (!collected.first()) return;
                        if (collected.first().count >= globalVars.starboardLimit) {
                            let avatar = message.author.displayAvatarURL({ format: "png", dynamic: true });
                            // Embed
                            const starEmbed = new Discord.MessageEmbed()
                                .setColor(globalVars.embedColor)
                                .setAuthor(`⭐ ${message.author.username}`, avatar)
                                .setDescription(message.content)
                                .addField(`Sent:`, `By ${message.author} in ${message.channel}`, false);
                            if (message.reference) starEmbed.addField(`Replying to:`, `"${ReplyMessage.content}" -${ReplyMessage.author}.`);
                            starEmbed
                                .addField(`Context:`, `[Link](${message.url})`, false)
                                .setImage(messageImage)
                                .setFooter(message.author.tag)
                                .setTimestamp(message.createdTimestamp);
                            // Sending logic
                            if (messageVideo) {
                                await starboard.send(starEmbed);
                                starboard.send({ files: [messageVideo] });
                            } else {
                                starboard.send(starEmbed);
                            };
                        };
                    };
                };
            };
        });
    } catch (e) {
        // log error
        const logger = require('../util/logger');

        logger(e, client);
    };
};