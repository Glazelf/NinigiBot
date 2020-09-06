module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (!message.member.hasPermission("ADMINISTRATOR")) {
            return message.reply(globalVars.lackPerms);
        };

        const { bank } = require('../../database/bank');
        let user = message.mentions.users.first();

        if (!user) {
            const input = message.content.split(` `, 2);
            let userID = input[1];
            user = client.users.cache.get(userID);
        };

        if (!user) return message.channel.send(`> Please use a proper mention if you want to reset someones bio, ${message.author}.`);

        bank.currency.biography(user.id, "None");

        return message.channel.send(`> Successfully reset ${user.tag}'s bio, ${message.author}.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};
