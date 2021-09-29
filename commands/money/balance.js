exports.run = async (client, message, args = [], language) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const getLanguageString = require('../../util/getLanguageString');
        const { bank } = require('../../database/bank');

        let target;
        if (message.mentions && (message.mentions.members.size > 0 || message.mentions.repliedUser)) {
            target = message.mentions.users.first();
        };

        // Get user
        if (!target) {
            let userID = args[0];
            target = client.users.cache.get(userID);
        };

        if (!target) target = message.member.user;

        let member;
        try {
            member = await message.guild.members.fetch(target);
        } catch (e) {
            // console.log(e);
            return sendMessage(client, message, `No member information could be found for this user.`);
        };

        let dbBalance = await bank.currency.getBalance(target.id);
        return sendMessage(client, message, `**${target.tag}** has ${Math.floor(dbBalance)}${globalVars.currency}.`);

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "balance",
    aliases: ["bal", "money"],
    description: "Sends how much money you have."
};