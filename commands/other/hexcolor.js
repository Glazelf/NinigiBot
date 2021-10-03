exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { PassThrough } = require('stream')
        const PImage = require('pureimage');
        const getTime = require('../../util/getTime');

        if (!args[0]) return sendMessage(client, message, `Please provide a hex to convert.`);

        let hex = args[0];
        while (hex.length < 6) hex = "0" + hex;
        let formattingHash = "#";
        let rgb = hexToRgb(hex);
        if (hex.startsWith("#")) formattingHash = "";

        if (!rgb) return sendMessage(client, message, `Please provide a valid hex. Color hexes are 6 characters long using characters 0-9 and A-F.`);

        let imgWidth = 225;
        let imgHeight = 100;
        let img = PImage.make(imgWidth, imgHeight);
        let ctx = img.getContext('2d');
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`;
        ctx.fillRect(0, 0, imgWidth, imgHeight);

        const stream = new PassThrough();
        await PImage.encodePNGToStream(img, stream);

        await sendMessage(client, message, `Here's the color for ${formattingHash}${hex}:`, null, stream);

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
        // Log error
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
