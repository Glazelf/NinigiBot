exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");

        let ephemeral = true;
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg === false) ephemeral = false;
        await interaction.deferReply({ ephemeral: ephemeral });

        let maxMessageLength = 2000;
        let noInputString = `You need to provide a valid input.`;
        let input = interaction.options.getString("input");
        // Sanitize input
        let sanitizeValues = [
            " ",
            "`",
            '"',
            "'",
            "{",
            "}",
            "[",
            "]",
            "<",
            ">",
            "&",
            "$"
        ];
        calcInput = input.replace("x", "*").replace(",", ".").replace(/[a-zA-Z]/gm, '');
        if (!calcInput.includes("!=")) calcInput = calcInput.replace("=", "==");
        sanitizeValues.forEach(function (value) {
            calcInput = calcInput.replace(value, "");
        });
        if (!calcInput) return sendMessage({ client: client, interaction: interaction, content: noInputString });
        try {
            var evaled = eval(calcInput);
        } catch (e) {
            // console.log(e);
            return sendMessage({ client: client, interaction: interaction, content: noInputString });
        };
        // Test out rounding based on remainder sometime
        // let remainder = evaled % 1;
        // Amount of 0's is the amount of decimals to round to
        let rounded = Math.round((evaled + Number.EPSILON) * 10000) / 10000;
        let output = Discord.Formatters.codeBlock("js", `${rounded} (${calcInput})`);
        let returnString = output;
        if (output.length > maxMessageLength) returnString = Discord.Formatters.codeBlock("js", rounded.toString());

        return sendMessage({ client: client, interaction: interaction, content: returnString });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "calculator",
    description: "Calculate.",
    options: [{
        name: "input",
        type: "STRING",
        description: "Input to calculate.",
        required: true
    }, {
        name: "ephemeral",
        type: "BOOLEAN",
        description: "Whether the response should be ephemeral."
    }]
};