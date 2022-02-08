const Discord = require("discord.js");
exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
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

        let commandName = "8ball";
        if (message.content) {
            if (!message.content.toLowerCase().startsWith(`${prefix}8ball`)) commandName = "Magic Conch";
        };

        if (!args[0]) return sendMessage({ client: client, message: message, content: `You need to provide something for the ${commandName} to consider.` });

        const answers = ["Maybe someday", "Nothing", "Neither", "I don't think so", "No", "Yes", "Try asking again", "Definitely", "Probably not"];
        const randomAnswer = answers[Math.floor(Math.random() * answers.length)];

        return sendMessage({ client: client, message: message, content: `The ${commandName} says: "${randomAnswer}.".` });

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "8ball",
    aliases: ["magicconch", "mc"],
    description: "Ask the magic 8ball for knowledge.",
    options: [{
        name: "input",
        type: Discord.ApplicationCommandOptionType.String,
        description: "Your burning question.",
        required: true
    }]
};
