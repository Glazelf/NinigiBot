module.exports.run = async (client, message) => {
    try {
        const { bank } = require('../../database/bank');
        const input = message.content.slice(1).trim();
        const [, , arguments] = input.match(/(\w+)\s*([\s\S]*)/);

        if (arguments.length < 1) return message.channel.send(`> Please specify a valid birthday in dd-mm format, ${message.author}.`);

        let birthday = /^(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])/.exec(arguments);

        if (!birthday) return message.channel.send(`> Please specify a valid birthday in dd-mm format, ${message.author}.`);

        bank.currency.birthday(message.author.id, birthday[1] + birthday[2]);
        return message.channel.send(`> Successfully updated your birthday, ${message.author}.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "birthday",
    aliases: ["birth"]
};