module.exports.run = async (client, message, args = []) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const Canvas = require("canvas");

        return sendMessage(client, message, `Certain image editing commands are currently broken. Check the following issue for more information: https://github.com/Glazelf/NinigiBot/issues/103`);

        let user;
        let member;
        if (message.mentions) {
            user = message.mentions.users.first();
            member = message.mentions.members.first();
        };
        let attachment = null;
        if (message.attachments.size > 0) attachment = message.attachments.values().next().value.attachment;

        if (!user) {
            let userID = args[0];
            user = client.users.cache.get(userID);
            member = message.guild.members.cache.get(userID);
        };

        if (!user || !member) {
            user = message.member.user;
        };

        let totalMessage = null;
        let avatar = null;
        let targetImage = null;
        let targetImageWidth = null;
        let targetImageHeight = null;
        if (attachment && message.member.id == client.config.ownerID) {
            targetImage = attachment;
            targetImageWidth = message.attachments.values().next().value.width;
            targetImageHeight = message.attachments.values().next().value.height;
            totalMessage = `Here you go, your inverted image:`;
        } else {
            if (user.avatarURL()) avatar = user.avatarURL({ format: "png", dynamic: true });
            if (!avatar) return message.channel.send(`${user.tag} doesn't have an avatar.`);
            targetImage = avatar;
            targetImageWidth = 128;
            targetImageHeight = 128;
            if (user.id == message.member.id) {
                totalMessage = `Here you go, your inverted avatar:`;
            } else {
                totalMessage = `Here you go, ${user.tag}'s inverted avatar:`;
            };
        };

        let startOffset = 0;
        let canvas = Canvas.createCanvas(targetImageWidth, targetImageHeight);
        let ctx = canvas.getContext('2d');
        let drawImage = await Canvas.loadImage(targetImage);
        ctx.drawImage(drawImage, startOffset, startOffset);
        ctx.beginPath();
        let imageData = ctx.getImageData(startOffset, startOffset, targetImageWidth, targetImageHeight);
        let data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            // red
            data[i] = 255 - data[i];
            // green
            data[i + 1] = 255 - data[i + 1];
            // blue
            data[i + 2] = 255 - data[i + 2];
        };

        // Overwrite image
        ctx.putImageData(imageData, startOffset, startOffset);
        ctx.closePath();
        ctx.clip();

        return sendMessage(client, message, totalMessage, null, canvas.toBuffer());

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "invert",
    aliases: [],
    description: "Invert a user's profile picture.",
    options: [{
        name: "user-mention",
        type: "MENTIONABLE",
        description: "Specify user by mention."
    }, {
        name: "user-id",
        type: "STRING",
        description: "Specify user by ID."
    }]
};
