module.exports.run = async (client, message, args = []) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const { bank } = require('../../database/bank');
        let biography
        if (args.length > 1) {
            biography = args.join(' ').match(/(\w+)\s*([\s\S]*)/);
        } else {
            biography = args[0];
        };

        if (!biography || biography.length < 1) return sendMessage(client, message, `Please specify a valid biography.`);

        if (biography.length > 50) return sendMessage(client, message, `Your bio must be under 50 characters to keep embeds remotely clean. The bio you tried to submit was \`${biography.length}\` characters long.`);

        bank.currency.biography(message.member.id, biography);

        return sendMessage(client, message, `Successfully updated your biography.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "biography",
    aliases: ["bio"],
    description: "Updates your biography",
    options: [{
        name: "biography",
        type: "STRING",
        description: "Biography body.",
        required: true
    }]
};