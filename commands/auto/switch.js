module.exports.run = async (client, message) => {
    try {
        const { bank } = require('../../database/bank');
        const input = message.content.slice(1).trim();
        const [, , arguments] = input.match(/(\w+)\s*([\s\S]*)/);

        let switchCodeGet = bank.currency.getSwitchCode(message.author.id);

        if (arguments.length < 1) {
            if (switchCodeGet && switchCodeGet !== "None") return message.channel.send(`> Your Nintendo Switch friend code is ${switchCodeGet}, ${message.author}.`)
            return message.channel.send(`> Please specify a valid Nintendo Switch friend code, ${message.author}.`);
        }
        let switchcode = /^(?:SW)?[- ]?([0-9]{4})[- ]?([0-9]{4})[- ]?([0-9]{4})$/.exec(arguments);

        if (!switchcode) return message.channel.send(`> Please specify a valid Nintendo Switch friend code, ${message.author}.`);

        switchcode = `SW-${switchcode[1]}-${switchcode[2]}-${switchcode[3]}`;
        bank.currency.switchCode(message.author.id, switchcode);
        return message.channel.send(`> Successfully updated your Nintendo Switch friend code, ${message.author}.`)

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.names = {
    name: "switch",
    aliases: ["switch", "friendcode"]
};