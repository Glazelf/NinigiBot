exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const fs = require('fs');
        const PImage = require('pureimage');
        const getTime = require('../../util/getTime');

        let timestamp = await getTime();

        let args = message.content.split(` `);
        if (!args[1]) return message.reply(`Please provide a hex to convert.`);

        let hex = args[1];
        let formattingHash = "#";
        let rgb = hexToRgb(hex);
        if (hex.startsWith("#")) formattingHash = "";

        if (!rgb) return message.reply(`Please provide a valid hex. Color hexes are 6 characters long including 0-9 and A-F.`);

        let imgWidth = 225;
        let imgHeight = 100;
        let img = PImage.make(imgWidth, imgHeight);
        let ctx = img.getContext('2d');
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`;
        ctx.fillRect(0, 0, imgWidth, imgHeight);

        await fs.promises.mkdir('memory/images', { recursive: true });
        let imgPath = `memory/images/hexcolor-${message.author.id}.png`;

        await PImage.encodePNGToStream(img, fs.createWriteStream(imgPath)).then(() => {
            // console.log(`Wrote out image ${imgPath}. (${timestamp})`);
        }).catch((e) => {
            // console.log(e);
            console.log(`Failed to create ${imgPath}. (${timestamp})`);
        });

        await message.reply(`Here's the color for ${formattingHash}${hex}:`, {
            files: [imgPath]
        });

        try {
            fs.unlinkSync(imgPath);
            // console.log(`Deleted image ${imgPath}. (${timestamp})`);
        } catch (e) {
            // console.log(e);
            console.log(`Failed to delete ${imgPath}. (${timestamp})`);
        };

        return;

        function hexToRgb(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "hexcolor",
    aliases: ["hexcolour"],
    description: "Sends image from hex code.",
    options: [{
        name: "hex",
        type: "STRING",
        description: "Hex code to convert."
    }]
};