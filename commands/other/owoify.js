exports.run = async (client, message, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const owoify = require('owoify-js').default;

        if (!args[0]) return sendMessage(client, message, `Please provide an input to owoify.`);
        let input = args.join(" ");
        let owoifiedInput = owoify(input, "uwu");

        return sendMessage(client, message, owoifiedInput);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "owoify",
    aliases: ["owo"],
    description: "OwOifies text.",
    options: [{
        name: "input",
        type: "STRING",
        description: "Text to owoify",
        required: true
    }]
};