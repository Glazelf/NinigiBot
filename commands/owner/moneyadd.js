const Discord = require("discord.js");
exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        if (message.member.id !== client.config.ownerID) return sendMessage({ client: client, message: message, content: globalVars.lackPerms });

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
            try {
                transferTarget = await client.users.fetch(userID);
            } catch (e) {
                // console.log(e);
            };
        };

        if (!transferTarget) return sendMessage({ client: client, message: message, content: `That's not a valid target.` });
        if (!transferAmount || isNaN(transferAmount)) return sendMessage({ client: client, message: message, content: `That's not a valid number.` });

        bank.currency.add(transferTarget.id, +transferAmount).then(dbBalance = await bank.currency.getBalance(message.member.id));
        userBalance = `${Math.floor(dbBalance)}${currency}`;

        return sendMessage({ client: client, message: message, content: `Successfully added ${transferAmount}${currency} to **${transferTarget.tag}**.` });

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "moneyadd",
    aliases: ["addmoney"],
    description: "Add money to a user.",
    permission: "owner",
    defaultPermission: false,
    options: [{
        name: "amount",
        type: Discord.ApplicationCommandOptionType.Integer,
        description: "Amount of money to add.",
        required: true
    }, {
        name: "user-mention",
        type: Discord.ApplicationCommandOptionType.User,
        description: "Specify user by mention."
    }, {
        name: "user-id",
        type: Discord.ApplicationCommandOptionType.String,
        description: "Specify user by ID."
    }]
};