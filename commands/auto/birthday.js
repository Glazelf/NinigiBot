module.exports.run = async (client, message) => {
    try {
        const { bank } = require('../../database/bank');
        const input = message.content.slice(1).trim();
        const [, , arguments] = input.match(/(\w+)\s*([\s\S]*)/);

        if (arguments.length < 1) return message.reply(`Please specify a valid birthday in dd-mm format.`);

        let birthday = /^(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])/.exec(arguments);

        if (!birthday) return message.reply(`Please specify a valid birthday in dd-mm format.`);

        bank.currency.birthday(message.author.id, birthday[1] + birthday[2]);
        return message.reply(`Successfully updated your birthday.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "birthday",
    aliases: ["bday", "birth"]
};