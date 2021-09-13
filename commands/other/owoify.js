exports.run = async (client, message, args = [], language) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const getLanguageString = require('../../util/getLanguageString');
        const Discord = require("discord.js");
        const owoify = require('owoify-js').default;

        if (!args[0]) return sendMessage(client, message, `Please provide an input to owoify.`);

        let input = args.join(" ");
        let severity = "owo";
        if (message.type != "APPLICATION_COMMAND") severity = message.content.substring(1, 4).toLowerCase();
        let inputOwOified = owoify(input, severity);
        let returnString = Discord.Formatters.codeBlock("fix", `${inputOwOified} (${severity})`);

        return sendMessage(client, message, returnString);

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "owoify",
    aliases: ["owo", "uwuify", "uwu", "uvuify", "uvu"],
    description: "OwOifies text.",
    options: [{
        name: "input",
        type: "STRING",
        description: "Text to owoify",
        required: true
    }]
};