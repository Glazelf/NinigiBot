exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        if (interaction.user.id !== client.config.ownerID) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        const { bank } = require('../../database/bank');
        let currency = globalVars.currency;

        let transferTarget = args.find(element => element.name == "user").user;
        let transferAmount = args.find(element => element.name == "amount").value;

        let dbBalance = await bank.currency.getBalance(transferTarget.id);
        let userBalance = `${Math.floor(dbBalance)}${currency}`;

        await bank.currency.add(transferTarget.id, +transferAmount).then(dbBalance = await bank.currency.getBalance(transferTarget.id));
        userBalance = `${Math.floor(dbBalance + transferAmount)}${currency}`;

        return sendMessage({ client: client, interaction: interaction, content: `Successfully added ${transferAmount}${currency} to ${transferTarget}. ${transferTarget} now has ${userBalance}.`, ephemeral: false });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "moneyadd",
    description: "Add money to a user.",
    serverID: "759344085420605471",
    options: [{
        name: "amount",
        type: "INTEGER",
        description: "Amount of money to add.",
        required: true
    }, {
        name: "user",
        type: "USER",
        description: "User to add money to.",
        required: true
    }]
};