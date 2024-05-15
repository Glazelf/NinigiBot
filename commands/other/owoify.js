const Discord = require("discord.js");
exports.run = async (client, interaction, logger, ephemeral) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const owoify = require('owoify-js').default;

        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg !== null) ephemeral = ephemeralArg;
        await interaction.deferReply({ ephemeral: ephemeral });

        let input = interaction.options.getString("input");
        let severity = interaction.options.getString("severity");
        if (!severity) severity = "owo";

        let inputOwOified = owoify(input, severity);
        let returnString = Discord.codeBlock("fix", inputOwOified);

        return sendMessage({ client: client, interaction: interaction, content: returnString, ephemeral: ephemeral });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

let severityChoices = [
    { name: "1. owo", value: "owo" },
    { name: "2. uwu", value: "uwu" },
    { name: "3. uvu", value: "uvu" }
];

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
        type: Discord.ApplicationCommandOptionType.String,
        description: "Severity of owoification.",
        choices: severityChoices
    }, {
        name: "ephemeral",
        type: Discord.ApplicationCommandOptionType.Boolean,
        description: "Whether or not to send the owoified text as an ephemeral message.",
    }]
};