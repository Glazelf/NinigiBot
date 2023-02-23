exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");

        let ephemeral = interaction.options.getBoolean("ephemeral");
        if (ephemeral === null) ephemeral = true;

        let input = null;

        // Make these seperate subcommands, main command "hex" with subcommands "tohex" and "todecimal" (or just combine this into /convert actually)
        // Get this from an argument instead if using slash commands
        switch (interaction.options.getSubcommand()) {
            case "tohex":
                input = interaction.options.getInteger("input");
                let failText = `Please provide a valid number to convert to hex.`;
                let hexString = input.toString(16).toUpperCase();
                while (hexString.length < 6) hexString = "0" + hexString;
                let returnString = Discord.Formatters.codeBlock("js", `0x${hexString}`)
                return sendMessage({ client: client, interaction: interaction, content: returnString, ephemeral: ephemeral });
                break;
            case "todecimal":
                try {
                    interaction.options.getString("input");
                    while (input.length < 6) input = "0" + input;
                    let argHex = `0x${input}`;
                    let hexInt = parseInt(argHex);
                    let returnString = Discord.Formatters.codeBlock("js", hexInt.toString())
                    return sendMessage({ client: client, interaction: interaction, content: returnString, ephemeral: ephemeral });
                } catch (e) {
                    return sendMessage({ client: client, interaction: interaction, content: `An error occurred trying to convert to decimal. Make sure your input is a valid hex.` });
                };
                break;
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "hexadecimal",
    description: "Convert a number to hexadecimal.",
    options: [{
        name: "tohex",
        type: "SUB_COMMAND",
        description: "Convert from decimal to hex.",
        options: [{
            name: "input",
            type: "INTEGER",
            description: "Decimal number to convert.",
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the response should be ephemeral."
        }]
    }, {
        name: "todecimal",
        type: "SUB_COMMAND",
        description: "Convert from hex to decimal.",
        options: [{
            name: "input",
            type: "STRING",
            description: "Hexadecimal to convert.",
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the response should be ephemeral."
        }]
    }]
};