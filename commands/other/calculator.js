exports.run = async (client, message, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');

        let noInputString = `You need to provide something to calculate`;
        if (!args[0]) return sendMessage(client, message, noInputString);

        // Split input
        const input = args.join(' ');

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

        if (!calcInput) return sendMessage(client, message, noInputString);

        try {
            var evaled = eval(calcInput);
        } catch (e) {
            // console.log(e);
            return sendMessage(client, message, `You need to provide a valid input.`);
        };

        // Test out rounding based on remainder sometime
        // let remainder = evaled % 1;

        // Amount of 0's is the amount of decimals to round to
        let rounded = Math.round((evaled + Number.EPSILON) * 10000) / 10000;

        return sendMessage(client, message, `\`\`\`js\n${rounded} (${calcInput})\n\`\`\``);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "calculator",
    aliases: ["calc", "calculate"],
    description: "Calculate.",
    options: [{
        name: "input",
        type: "STRING",
        description: "Input to calculate.",
        required: true
    }]
};