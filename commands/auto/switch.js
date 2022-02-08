const Discord = require("discord.js");
exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { bank } = require('../../database/bank');

        let switchCodeGet = await bank.currency.getSwitchCode(message.member.id);

        // Present code if no code is supplied as an argument
        if (args.length < 1) {
            if (switchCodeGet && switchCodeGet !== "None") return sendMessage({ client: client, message: message, content: `Your Nintendo Switch friend code is ${switchCodeGet}.` });
            return sendMessage({ client: client, message: message, content: `Please specify a valid Nintendo Switch friend code.` });
        };

        // Check and sanitize input
        let switchcode = /^(?:SW)?[- ]?([0-9]{4})[- ]?([0-9]{4})[- ]?([0-9]{4})$/.exec(args);
        if (!switchcode) return sendMessage({ client: client, message: message, content: `Please specify a valid Nintendo Switch friend code.` });

        switchcode = `SW-${switchcode[1]}-${switchcode[2]}-${switchcode[3]}`;
        bank.currency.switchCode(message.member.id, switchcode);
        return sendMessage({ client: client, message: message, content: `Successfully updated your Nintendo Switch friend code.` });

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "switch",
    aliases: ["fc", "friendcode"],
    description: "Updates your Switch friend code.",
    options: [{
        name: "switch-fc",
        type: Discord.ApplicationCommandOptionType.String,
        description: "SW-1234-1234-1234"
    }]
};