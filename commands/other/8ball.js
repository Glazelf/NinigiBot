const Discord = require("discord.js");
exports.run = async (client, interaction, logger, ephemeral = true) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        let input = interaction.options.getString("input");
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg !== null) ephemeral = ephemeralArg;
        const answers = ["Maybe someday", "Nothing", "Neither", "I don't think so", "No", "Yes", "Try asking again", "Definitely", "Probably not"];
        const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
        return sendMessage({ client: client, interaction: interaction, content: `The 8ball says: "${randomAnswer}.".`, ephemeral: ephemeral });

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
        type: Discord.ApplicationCommandOptionType.String,
        description: "Your burning question.",
        required: true
    }, {
        name: "ephemeral",
        type: Discord.ApplicationCommandOptionType.Boolean,
        description: "Whether the response should be ephemeral.",
    }]
};