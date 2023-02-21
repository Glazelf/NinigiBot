exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const api_user = require('../../database/dbServices/user.api');

        const currentBalance = await api_user.getMoney(interaction.user.id);
        let transferAmount = interaction.options.getInteger("amount");
        let transferTarget = interaction.options.getUser("user");
        let userBalance = `${Math.floor(currentBalance)}${globalVars.currency}`;

        if (transferTarget == interaction.user) return sendMessage({ client: client, interaction: interaction, content: `You can't transfer money to yourself.` });
        if (transferAmount > currentBalance) return sendMessage({ client: client, interaction: interaction, content: `You only have ${userBalance}.` });
        if (transferAmount < 1) return sendMessage({ client: client, interaction: interaction, content: `Please enter an amount greater than zero.` });

        api_user.addMoney(interaction.user.id, -transferAmount);
        api_user.addMoney(transferTarget.id, transferAmount);

        return sendMessage({ client: client, interaction: interaction, content: `Transferred ${transferAmount}${globalVars.currency} to ${transferTarget}.`, ephemeral: ephemeral });

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
