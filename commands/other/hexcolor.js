exports.run = async (client, message, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const fs = require('fs');
        const PImage = require('pureimage');
        const getTime = require('../../util/getTime');

        let timestamp = await getTime(client);

        if (!args[0]) return sendMessage(client, message, `Please provide a hex to convert.`);

        let hex = args[0];
        while (hex.length < 6) hex = "0" + hex;
        let formattingHash = "#";
        let rgb = hexToRgb(hex);
        if (hex.startsWith("#")) formattingHash = "";

        if (!rgb) return sendMessage(client, message, `Please provide a valid hex. Color hexes only include 0-9 and A-F.`);

        let imgWidth = 225;
        let imgHeight = 100;
        let img = PImage.make(imgWidth, imgHeight);
        let ctx = img.getContext('2d');
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`;
        ctx.fillRect(0, 0, imgWidth, imgHeight);

        await fs.promises.mkdir('memory/images', { recursive: true });
        let imgPath = `memory/images/hexcolor-${message.member.id}.png`;

        await PImage.encodePNGToStream(img, fs.createWriteStream(imgPath)).then(() => {
            // console.log(`Wrote out image ${imgPath}. (${timestamp})`);
        }).catch((e) => {
            // console.log(e);
            console.log(`Failed to create ${imgPath}. (${timestamp})`);
        });

        await sendMessage(client, message, `Here's the color for ${formattingHash}${hex}:`, null, imgPath);

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
    aliases: ["hexcolour", "colorhex", "colourhex"],
    description: "Sends image from hex code.",
    options: [{
        name: "hex",
        type: "STRING",
        description: "Hex code to convert."
    }]
};
