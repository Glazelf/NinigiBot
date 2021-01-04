module.exports.run = async (client, message) => {
    try {
        if (!message.channel.permissionsFor(message.guild.me).has("ATTACH_FILES")) return message.channel.send(`> I can't send you files because I don't have permissions to attach files to my messages, ${message.author}.`);

        const Discord = require("discord.js");
        const Canvas = require("canvas");

        let user = message.mentions.users.first();
        let attachment = message.attachments.values().next().value.attachment;

        if (!user) {
            const input = message.content.split(` `, 2);
            let userID = input[1];
            user = client.users.cache.get(userID);
        };

        if (!user) {
            user = message.author;
        };

        let totalMessage = null;
        let avatar = null;
        let targetImage = null;
        let targetImageWidth = null;
        let targetImageHeight = null;
        if (attachment) {
            targetImage = attachment;
            targetImageWidth = message.attachments.values().next().value.width;
            targetImageHeight = message.attachments.values().next().value.height;
            totalMessage = `> Here you go, ${message.author}, your inverted image`;
        } else {
            if (user.avatarURL()) avatar = user.avatarURL({ format: "png", dynamic: true });
            if (!avatar) return message.channel.send(`> ${user.tag} doesn't have an avatar, ${message.author}.`);
            targetImage = avatar;
            targetImageWidth = 128;
            targetImageHeight = 128;
            if (user.id == message.author.id) {
                totalMessage = `> Here you go, ${message.author}, your inverted avatar.`;
            } else {
                totalMessage = `> Here you go, ${message.author}, ${user.tag}'s inverted avatar.`;
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

        return message.channel.send(totalMessage, {
            files: [canvas.toBuffer()]
        });

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "invert",
    aliases: []
};
