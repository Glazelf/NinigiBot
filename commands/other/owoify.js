exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const owoify = require('owoify-js').default;

        if (!args[0]) return sendMessage({ client: client, interaction: interaction, content: `Please provide an input to owoify.` });

        let input = args.join(" ");
        let severity = "owo";
        let inputOwOified = owoify(input, severity);
        let returnString = Discord.Formatters.codeBlock("fix", `${inputOwOified} (${severity})`);

        return sendMessage({ client: client, interaction: interaction, content: returnString });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "owoify",
    description: "OwOifies text.",
    options: [{
        name: "input",
        type: 3,
        description: "Text to owoify",
        required: true
    }]
};