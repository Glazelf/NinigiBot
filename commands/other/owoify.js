exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const owoify = require('owoify-js').default;

        let input = args.find(element => element.name == "input").value;
        let severityArg = args.find(element => element.name == "severity");
        let severity = "owo";
        if (severityArg) {
            if (severityArg.value <= 1) severity = "owo";
            if (severityArg.value == 2) severity = "uwu";
            if (severityArg.value >= 3) severity = "uvu";
        };
        let ephemeral = true;
        let ephemeralArg = args.find(element => element.name == "ephemeral");
        if (ephemeralArg) ephemeral = ephemeralArg.value;

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
        type: "INTEGER",
        description: "Severity of owoification. (1-3)",
    }, {
        name: "ephemeral",
        type: "BOOLEAN",
        description: "Whether or not to send the owoified text as an ephemeral message.",
    }]
};