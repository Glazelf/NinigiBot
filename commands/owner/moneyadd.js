exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isOwner = require('../../util/isOwner');
        let ownerBool = await isOwner(client, interaction.user);
        if (!ownerBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        const api_user = require('../../database/dbServices/user.api');
        let currency = globalVars.currency;

        let transferTarget = interaction.options.getUser("user");
        let transferAmount = interaction.options.getInteger("amount");

        if (!transferTarget) return sendMessage({ client: client, interaction: interaction, content: `Could not find user.` });

        let dbBalance = await api_user.getMoney(transferTarget.id);
        let userBalance = `${Math.floor(dbBalance)}${currency}`;

        await api_user.addMoney(transferTarget.id, +transferAmount);
        userBalance = `${Math.floor(dbBalance + transferAmount)}${currency}`;

        return sendMessage({ client: client, interaction: interaction, content: `Added ${transferAmount}${currency} to ${transferTarget}. ${transferTarget} now has ${userBalance}.` });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "moneyadd",
    description: "Add money to a user.",
    serverID: ["759344085420605471"],
    options: [{
        name: "amount",
        type: "INTEGER",
        description: "Amount of money to add.",
        required: true
    }, {
        name: "user",
        type: "USER",
        description: "Specify user.",
        required: true
    }]
};