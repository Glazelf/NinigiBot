exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const api_user = require('../../database/dbServices/user.api');

        let switchCodeGet = await api_user.getSwitchCode(interaction.user.id);
        let switchFC = interaction.options.getString('switch-fc');

        let invalidString = `Please specify a valid Nintendo Switch friend code.`;

        // Present code if no code is supplied as an argument
        if (!switchFC) {
            if (switchCodeGet) return sendMessage({ client: client, interaction: interaction, content: `${interaction.user.username}'s Nintendo Switch friend code is ${switchCodeGet}.`, ephemeral: false });
            return sendMessage({ client: client, interaction: interaction, content: invalidString });
        };

        // Check and sanitize input
        switchFC = /^(?:SW)?[- ]?([0-9]{4})[- ]?([0-9]{4})[- ]?([0-9]{4})$/.exec(switchFC);
        if (!switchFC) return sendMessage({ client: client, interaction: interaction, content: invalidString });
        switchFC = `SW-${switchFC[1]}-${switchFC[2]}-${switchFC[3]}`;

        api_user.setSwitchCode(interaction.user.id, switchFC);
        return sendMessage({ client: client, interaction: interaction, content: `Updated your Nintendo Switch friend code.` });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "switch",
    description: "Updates your Switch friend code.",
    options: [{
        name: "switch-fc",
        type: "STRING",
        description: "Switch friend code, example: SW-1234-1234-1234"
    }]
};