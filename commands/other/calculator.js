exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        // Split input
        const input = message.content.slice(1).trim();
        let [, , calcInput] = input.match(/(\w+)\s*([\s\S]*)/);

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
        calcInput = calcInput.replace(/[a-zA-Z]/gm, '').replace(",", ".");
        if (!calcInput.includes("!=")) calcInput = calcInput.replace("=", "==");
        sanitizeValues.forEach(function (value) {
            calcInput = calcInput.replace(value, "");
        });

        if (!calcInput) return message.channel.send(`> You need to provide something to calculate, ${message.author}.`);

        try {
            var evaled = eval(calcInput);
        } catch (e) {
            console.log(e);
            return message.channel.send(`> You need to provide a valid input, ${message.author}.`);
        };

        // Test out rounding based on remainder sometime
        // let remainder = evaled % 1;

        // Amount of 0's is the amount of decimals to round to
        let rounded = Math.round((evaled + Number.EPSILON) * 10000) / 10000;

        return message.channel.send(rounded, { code: "js" });

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "calculator",
    aliases: ["calc"]
};