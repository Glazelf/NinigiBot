exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const owoify = require('owoify-js').default;

        let ephemeral = interaction.options.getBoolean("ephemeral");
        if (ephemeral === null) ephemeral = true;
        await interaction.deferReply({ ephemeral: ephemeral });

        let input = interaction.options.getString("input");
        let severity = interaction.options.getString("severity");
        if (!severity) severity = "owo";

        let inputOwOified = owoify(input, severity);
        let returnString = Discord.Formatters.codeBlock("fix", `${inputOwOified} (${severity})`);

        return sendMessage({ client: client, interaction: interaction, content: returnString, ephemeral: ephemeral });

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
        type: "STRING",
        description: "Text to owoify",
        required: true
    }, {
        name: "severity",
        type: "STRING",
        description: "Severity of owoification.",
        choices: [
            { name: "owo", value: "owo" },
            { name: "uwu", value: "uwu" },
            { name: "uvu", value: "uvu" }
        ]
    }, {
        name: "ephemeral",
        type: "BOOLEAN",
        description: "Whether or not to send the owoified text as an ephemeral message.",
    }]
};