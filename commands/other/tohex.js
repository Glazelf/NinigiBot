exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");

        let user = message.member.user;

        if (!args[0]) return sendMessage({ client: client, interaction: interaction, content: `Please provid an argument.` });
        let input = args[0];

        // Make these seperate subcommands, main command "hex" with subcommands "tohex" and "todecimal" (or just combine this into /convert actually)
        if (message.content.toLowerCase().startsWith(`/todecimal`)) {
            try {
                while (input.length < 6) input = "0" + input;
                let argHex = `0x${input}`;
                let hexInt = parseInt(argHex);
                let returnString = Discord.Formatters.codeBlock("js", `${hexInt} (${user.tag})`)
                return sendMessage({ client: client, interaction: interaction, content: returnString });
            } catch (e) {
                return sendMessage({ client: client, interaction: interaction, content: `An error occurred trying to convert to decimal. Make sure your input is a valid hex.` });
            };
        } else {
            if (isNaN(input)) return sendMessage({ client: client, interaction: interaction, content: `Please provide a valid number to convert to hex.` });
            let argInt = parseInt(input);
            let hexString = argInt.toString(16).toUpperCase();
            let returnString = Discord.Formatters.codeBlock("js", `${hexString} (${user.tag})`)
            return sendMessage({ client: client, interaction: interaction, content: returnString });
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "tohex",
    description: "Convert a number to hexadecimal.",
    options: [{
        name: "input",
        type: 4,
        description: "Input number."
    }]
};