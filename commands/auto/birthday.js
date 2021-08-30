const sendMessage = require('../../util/sendMessage');

exports.run = async (client, message, args = []) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const getLanguageString = require('../../util/getLanguageString');
        const { bank } = require('../../database/bank');

        if (args.length < 1) return sendMessage(client, message, `Please specify a valid birthday in dd-mm format.`);

        let birthday = /^(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])/.exec(args);

        if (!birthday) return sendMessage(client, message, `Please specify a valid birthday in dd-mm format.`);

        bank.currency.birthday(message.member.id, birthday[1] + birthday[2]);
        return sendMessage(client, message, `Successfully updated your birthday.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "birthday",
    aliases: ["bday", "birth"],
    description: "Updates your birthday",
    options: [{
        name: "birthday",
        type: "STRING",
        description: "Birthday in \"dd-mm\" format.",
        required: true
    }]
};