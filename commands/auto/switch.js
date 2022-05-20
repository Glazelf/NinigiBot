exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { bank } = require('../../database/bank');

        let switchCodeGet = await bank.currency.getSwitchCode(interaction.member.id);
        let fcArgument = args.find(element => element.name == 'switch-fc');
        let switchFC;
        if (fcArgument) switchFC = fcArgument.value;

        let invalidString = `Please specify a valid Nintendo Switch friend code.`;

        // Present code if no code is supplied as an argument
        if (!switchFC) {
            if (switchCodeGet) return sendMessage({ client: client, interaction: interaction, content: `**${interaction.user.username}**'s Nintendo Switch friend code is ${switchCodeGet}.`, ephemeral: false });
            return sendMessage({ client: client, interaction: interaction, content: invalidString });
        };

        // Check and sanitize input
        switchFC = /^(?:SW)?[- ]?([0-9]{4})[- ]?([0-9]{4})[- ]?([0-9]{4})$/.exec(switchFC);
        if (!switchFC) return sendMessage({ client: client, interaction: interaction, content: invalidString });
        switchFC = `SW-${switchFC[1]}-${switchFC[2]}-${switchFC[3]}`;

        bank.currency.switchCode(interaction.member.id, switchFC);
        return sendMessage({ client: client, interaction: interaction, content: `Successfully updated your Nintendo Switch friend code.` });

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