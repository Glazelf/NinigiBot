const Discord = require("discord.js");
exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');

        let input = interaction.options.getString("input");
        const answers = ["Maybe someday", "Nothing", "Neither", "I don't think so", "No", "Yes", "Try asking again", "Definitely", "Probably not"];
        const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
        return sendMessage({ client: client, interaction: interaction, content: `The 8ball says: "${randomAnswer}.".` });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "8ball",
    description: "Ask the magic 8ball for knowledge.",
    options: [{
        name: "input",
        type: "STRING",
        description: "Your burning question.",
        required: true
    }]
};
