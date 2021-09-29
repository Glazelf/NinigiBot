exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const { Prefixes } = require('../../database/dbObjects');
        let prefix = await Prefixes.findOne({ where: { server_id: message.guild.id } });
        if (prefix) {
            prefix = prefix.prefix;
        } else {
            prefix = globalVars.prefix;
        };

        let user = message.member.user;

        if (!args[0]) return sendMessage(client, message, `Please provid an argument.`);
        let input = args[0];

        if (message.content.toLowerCase().startsWith(`${prefix}todecimal`)) {
            try {
                while (input.length < 6) input = "0" + input;
                let argHex = `0x${input}`;
                let hexInt = parseInt(argHex);
                let returnString = Discord.Formatters.codeBlock("js", `${hexInt} (${user.tag})`)
                return sendMessage(client, message, returnString);
            } catch (e) {
                return sendMessage(client, message, `An error occurred trying to convert to decimal. Make sure your input is a valid hex.`);
            };
        } else {
            if (isNaN(input)) return sendMessage(client, message, `Please provide a valid number to convert to hex.`);
            let argInt = parseInt(input);
            let hexString = argInt.toString(16).toUpperCase();
            let returnString = Discord.Formatters.codeBlock("js", `${hexString} (${user.tag})`)
            return sendMessage(client, message, returnString);
        };

    } catch (e) {
        // Log error
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