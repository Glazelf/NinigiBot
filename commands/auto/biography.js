module.exports.run = async (client, message) => {
    try {
        const { bank } = require('../../database/bank');
        const input = message.content.slice(1).trim();
        const [, , biography] = input.match(/(\w+)\s*([\s\S]*)/);

        if (!biography) return message.reply(`Please specify a valid biography.`);

        if (biography.length > 50) return message.reply(`Your bio must be under 50 characters to keep embeds remotely clean. The bio you tried to submit was \`${biography.length}\` characters long.`);

        bank.currency.biography(message.author.id, biography);

        return message.reply(`Successfully updated your biography.`);

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