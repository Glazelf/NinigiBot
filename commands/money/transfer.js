exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { bank } = require('../../database/bank');
        const currentBalance = await bank.currency.getBalance(interaction.user.id);
        let transferAmount = args.find(element => element.name == "amount").value;
        let transferTarget = args.find(element => element.name == "user").user;

        let user = interaction.user;
        let userBalance = `${Math.floor(currentBalance)}${globalVars.currency}`;

        if (transferTarget == user) return sendMessage({ client: client, interaction: interaction, content: `You can't transfer money to yourself.` });
        if (transferAmount > currentBalance) return sendMessage({ client: client, interaction: interaction, content: `You only have ${userBalance}.` });
        if (transferAmount < 1) return sendMessage({ client: client, interaction: interaction, content: `Please enter an amount greater than zero.` });

        bank.currency.add(interaction.user.id, -transferAmount);
        bank.currency.add(transferTarget.id, transferAmount);

        return sendMessage({ client: client, interaction: interaction, content: `Successfully transferred ${transferAmount}${globalVars.currency} to ${transferTarget}.`, ephemeral: false });

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
