exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { PassThrough } = require('stream')
        const PImage = require('pureimage');
        const getTime = require('../../util/getTime');

        let hex = args.find(element => element.name == "hex").value;
        while (hex.length < 6) hex = "0" + hex;
        let formattingHash = "#";
        let rgb = hexToRgb(hex);
        if (hex.startsWith("#")) formattingHash = "";

        if (!rgb) return sendMessage({ client: client, interaction: interaction, content: `Please provide a valid hex. Color hexes are 6 characters long using characters 0-9 and A-F.` });

        let imgWidth = 225;
        let imgHeight = 100;
        let img = PImage.make(imgWidth, imgHeight);
        let ctx = img.getContext('2d');
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`;
        ctx.fillRect(0, 0, imgWidth, imgHeight);

        const stream = new PassThrough();
        await PImage.encodePNGToStream(img, stream);

        return sendMessage({ client: client, interaction: interaction, content: `Here's the color for **${formattingHash}${hex}**:`, files: stream });

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
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "hexcolor",
    description: "Sends image from hexadecimal.",
    options: [{
        name: "hex",
        type: "STRING",
        description: "Hexadecimal to convert.",
        required: true
    }]
};
