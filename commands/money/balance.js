exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { bank } = require('../../database/bank');

        let dbBalance = await bank.currency.getBalance(interaction.user.id);
        return sendMessage({ client: client, interaction: interaction, content: `You have ${Math.floor(dbBalance)}${globalVars.currency}.` });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "balance",
    description: "Sends how much money you have."
};