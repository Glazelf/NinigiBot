exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        // Split input
        const input = message.content.slice(1).trim();
        let [, , calcInput] = input.match(/(\w+)\s*([\s\S]*)/);

        // Sanitize input
        calcInput = calcInput.replace(/[a-zA-Z]/gm, '').replace(" ", "");

        if (!calcInput) return message.channel.send(`> You need to provide something to calculate, ${message.author}.`);

        try {
            var evaled = eval(calcInput);
        } catch (e) {
            console.log(e);
            return message.channel.send(`> You need to provide a valid input, ${message.author}.`);
        };

        return message.channel.send(evaled, { code: "js" });

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