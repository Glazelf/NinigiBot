exports.run = async (client, message, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { Prefixes } = require('../../database/dbObjects');
        let prefix = await Prefixes.findOne({ where: { server_id: message.guild.id } });
        if (prefix) {
            prefix = prefix.prefix;
        } else {
            prefix = globalVars.prefix;
        };

        if (!args[0]) return sendMessage(client, message, `Please provid an argument.`);
        let input = args[0];

        if (message.content.toLowerCase().startsWith(`${prefix}todecimal`)) {
            try {
                while (input.length < 6) input = "0" + input;
                let argHex = `0x${input}`;
                let hexInt = parseInt(argHex);
                return sendMessage(client, message, `${hexInt} (${message.author.tag})`, null, null, false, "js");
            } catch (e) {
                return sendMessage(client, message, `An error occurred trying to convert to decimal. Make sure your input is a valid hex.`);
            };
        } else {
            if (isNaN(input)) return sendMessage(client, message, `Please provide a valid number to convert to hex.`);
            let argInt = parseInt(input);
            let hexString = argInt.toString(16).toUpperCase();
            return sendMessage(client, message, `${hexString} (${message.author.tag})`, null, null, false, "js");
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "tohex",
    aliases: ["todecimal"],
    description: "Convert a number to hexadecimal.",
    options: [{
        name: "input",
        type: "INTEGER",
        description: "Input number."
    }]
};