const Discord = require('discord.js');

exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        
        const owoify = require('owoify-js').default;

        let ephemeral = true;
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg === false) ephemeral = false;
        await interaction.deferReply({ ephemeral: ephemeral });

        let input = interaction.options.getString("input");
        let severityArg = interaction.options.getInteger("severity");
        let severity = "owo";
        if (severityArg) {
            if (severityArg <= 1) severity = "owo";
            if (severityArg == 2) severity = "uwu";
            if (severityArg >= 3) severity = "uvu";
        };

        let inputOwOified = owoify(input, severity);
        let returnString = Discord.codeBlock("fix", `${inputOwOified} (${severity})`);

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
        type: Discord.ApplicationCommandOptionType.String,
        description: "Text to owoify",
        required: true
    }, {
        name: "severity",
        type: Discord.ApplicationCommandOptionType.Integer,
        description: "Severity of owoification. (1-3)",
    }, {
        name: "ephemeral",
        type: Discord.ApplicationCommandOptionType.Boolean,
        description: "Whether or not to send the owoified text as an ephemeral message.",
    }]
};