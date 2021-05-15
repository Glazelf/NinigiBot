module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const isAdmin = require('../../util/isAdmin');
        if (!message.member.hasPermission("MANAGE_MEMBERS") && !isAdmin(message.member, client) && message.author.id !== client.config.ownerID) return message.reply(globalVars.lackPerms);

        const { bank } = require('../../database/bank');
        let user = message.mentions.users.first();

        if (!user) {
            const input = message.content.split(` `, 2);
            let userID = input[1];
            user = client.users.cache.get(userID);
        };

        if (!user) return message.reply(`Please use a proper mention if you want to reset someones bio.`);

        bank.currency.biography(user.id, "None");

        return message.reply(`Successfully reset ${user.tag}'s bio.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "bioreset",
    aliases: []
};