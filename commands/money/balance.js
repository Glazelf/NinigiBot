const Discord = require("discord.js");
exports.run = async (client, interaction, logger) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const api_user = require('../../database/dbServices/user.api');
        let dbBalance = await api_user.getMoney(interaction.user.id);
        return sendMessage({ client: client, interaction: interaction, content: `You have ${Math.floor(dbBalance)}${client.globalVars.currency}.` });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "balance",
    description: "Sends how much money you have."
};