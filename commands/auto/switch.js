module.exports.run = async (client, message, args = []) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const { bank } = require('../../database/bank');

        let switchCodeGet = bank.currency.getSwitchCode(message.author.id);

        if (args.length < 1) {
            if (switchCodeGet && switchCodeGet !== "None") return sendMessage(client, message, `Your Nintendo Switch friend code is ${switchCodeGet}.`);
            return sendMessage(client, message, `Please specify a valid Nintendo Switch friend code.`);
        };

        let switchcode = /^(?:SW)?[- ]?([0-9]{4})[- ]?([0-9]{4})[- ]?([0-9]{4})$/.exec(args);
        if (!switchcode) return sendMessage(client, message, `Please specify a valid Nintendo Switch friend code.`);

        switchcode = `SW-${switchcode[1]}-${switchcode[2]}-${switchcode[3]}`;
        bank.currency.switchCode(message.author.id, switchcode);
        return sendMessage(client, message, `Successfully updated your Nintendo Switch friend code.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "switch",
    aliases: ["fc", "friendcode"],
    description: "Updates your Switch friend code.",
    options: [{
        name: "switch-fc",
        type: "STRING",
        description: "SW-1234-1234-1234"
    }]
};