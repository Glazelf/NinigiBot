exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const getLanguageString = require('../../util/getLanguageString');
        if (message.member.id !== client.config.ownerID) return sendMessage(client, message, globalVars.lackPerms);

        const { bank } = require('../../database/bank');
        let currency = globalVars.currency;

        const transferAmount = args[1]
        let transferTarget;
        if (message.mentions && (message.mentions.members.size > 0 || message.mentions.repliedUser)) {
            transferTarget = message.mentions.users.first();
        };

        let dbBalance = await bank.currency.getBalance(message.member.id);
        let userBalance = `${Math.floor(dbBalance)}${currency}`;

        if (!transferTarget) {
            let userID = args[0];
            transferTarget = await client.users.fetch(userID);
        };

        if (!transferTarget) return sendMessage(client, message, `That's not a valid target.`);
        if (!transferAmount || isNaN(transferAmount)) return sendMessage(client, message, `That's not a valid number.`);

        bank.currency.add(transferTarget.id, +transferAmount).then(dbBalance = await bank.currency.getBalance(message.member.id));
        userBalance = `${Math.floor(dbBalance)}${currency}`;

        return sendMessage(client, message, `Successfully added ${transferAmount}${currency} to **${transferTarget.tag}**.`);

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "moneyadd",
    aliases: ["addmoney"],
    description: "Add money to a user.",
    options: [{
        name: "amount",
        type: "INTEGER",
        description: "Amount of money to add.",
        required: true
    }, {
        name: "user-mention",
        type: "MENTIONABLE",
        description: "Specify user by mention."
    }, {
        name: "user-id",
        type: "STRING",
        description: "Specify user by ID."
    }]
};