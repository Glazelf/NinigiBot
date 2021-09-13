exports.run = async (client, message, args = [], language) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const getLanguageString = require('../../util/getLanguageString');
        const { bank } = require('../../database/bank');

        // Check and sanitize birthday
        let birthdayNoArgument = await getLanguageString(client, language, 'birthdayNoArgument');
        birthdayNoArgument = birthdayNoArgument.replace('[birthdayFormat]', '`dd-mm`');
        let birthdayUpdateSuccess = await getLanguageString(client, language, 'birthdayUpdateSuccess');

        if (args.length < 1) return sendMessage(client, message, birthdayNoArgument);
        let birthday = /^(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])/.exec(args);
        if (!birthday) return sendMessage(client, message, birthdayNoArgument);

        bank.currency.birthday(message.member.id, birthday[1] + birthday[2]);
        return sendMessage(client, message, birthdayUpdateSuccess);

    } catch (e) {
        // Log error
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