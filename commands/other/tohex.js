exports.run = async (client, message, args) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const { Prefixes } = require('../../database/dbObjects');
        let prefix = await Prefixes.findOne({ where: { server_id: message.guild.id } });
        if (prefix) {
            prefix = prefix.prefix;
        } else {
            prefix = globalVars.prefix;
        };

        if (!args[0]) return message.channel.send(`> Please provid an argument, ${message.author}.`);

        if (message.content.toLowerCase().startsWith(`${prefix}todecimal`)) {
            try {
                let argHex = `0x${args[0]}`;
                let hexInt = parseInt(argHex);
                return message.channel.send(`\`\`\`${hexInt}\`\`\``);
            } catch (e) {
                return message.channel.send(`> An error occurred trying to convert to decimal. Make sure your input is a valid hex, ${message.author}.`);
            };
        } else {
            if (isNaN(args[0])) return message.channel.send(`> Please provide a valid number to convert to hex, ${message.author}.`);
            let argInt = parseInt(args[0]);
            let hexString = argInt.toString(16).toUpperCase();
            return message.channel.send(`\`\`\`${hexString}\`\`\``);
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "tohex",
    aliases: ["todecimal"]
};