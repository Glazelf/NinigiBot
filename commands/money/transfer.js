exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { bank } = require('../../database/bank');
        const currentAmount = await bank.currency.getBalance(message.member.id);
        let transferAmount = args[0];
        let transferTarget;

        // Get target
        if (message.mentions && (message.mentions.members.size > 0 || message.mentions.repliedUser)) {
            transferTarget = message.mentions.users.first();
        };
        if (!transferTarget) {
            let userID = args[1];
            transferTarget = client.users.cache.get(userID);
        };
        if (!transferTarget) return;
        let user;
        if (message.type == 'APPLICATION_COMMAND') {
            user = message.member.user;
        } else {
            user = message.author;
        };
        let userBalance = `${Math.floor(currentAmount)}${globalVars.currency}`;

        // Catch errors
        if (transferTarget == user) return sendMessage(client, message, `You can't transfer money to yourself.`)
        if (!transferAmount || isNaN(transferAmount)) return sendMessage(client, message, `You need to specify a valid number to transfer.`);
        if (transferAmount > currentAmount) return sendMessage(client, message, `You don't have enough money to transfer that much, you only have ${userBalance}.`);
        if (transferAmount <= 0) return sendMessage(client, message, `Please enter an amount greater than zero.`);

        // Database
        bank.currency.add(message.member.id, -transferAmount);
        bank.currency.add(transferTarget.id, transferAmount);

        return sendMessage(client, message, `Successfully transferred ${transferAmount}${globalVars.currency} to **${transferTarget.tag}**`);

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "transfer",
    aliases: ["give"],
    description: "Give money to another user.",
    options: [{
        name: "user-mention",
        type: "MENTIONABLE",
        description: "Specify user by mention."
    }, {
        name: "user-id",
        type: "STRING",
        description: "Specify user by ID."
    }]
};
