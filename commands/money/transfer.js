exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
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
            try {
                transferTarget = await client.users.fetch(userID);
            } catch (e) {
                // console.log(e);
            };
        };
        if (!transferTarget) return;

        let user = interaction.user;
        let userBalance = `${Math.floor(currentAmount)}${globalVars.currency}`;

        // Catch errors
        if (transferTarget == user) return sendMessage({ client: client, interaction: interaction, content: `You can't transfer money to yourself.` });
        if (!transferAmount || isNaN(transferAmount)) return sendMessage({ client: client, interaction: interaction, content: `You need to specify a valid number to transfer.` });
        if (transferAmount > currentAmount) return sendMessage({ client: client, interaction: interaction, content: `You don't have enough money to transfer that much, you only have ${userBalance}.` });
        if (transferAmount <= 0) return sendMessage({ client: client, interaction: interaction, content: `Please enter an amount greater than zero.` });

        // Database
        bank.currency.add(message.member.id, -transferAmount);
        bank.currency.add(transferTarget.id, transferAmount);

        return sendMessage({ client: client, interaction: interaction, content: `Successfully transferred ${transferAmount}${globalVars.currency} to ${transferTarget.username}.` });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "transfer",
    description: "Give money to another user.",
    options: [{
        name: "user",
        type: "USER",
        description: "Specify user.",
        required: true
    }, {
        name: "amount",
        type: "INTEGER",
        description: "Specify amount.",
        required: true
    }]
};
