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

        // Present code if no code is supplied as an argument
        if (!switchFC) {
            if (switchCodeGet && switchCodeGet !== "None") return sendMessage({ client: client, interaction: interaction, content: `Your Nintendo Switch friend code is ${switchCodeGet}.` });
            return sendMessage({ client: client, interaction: interaction, content: `Please specify a valid Nintendo Switch friend code.` });
        };

        // Check and sanitize input
        let switchcode = /^(?:SW)?[- ]?([0-9]{4})[- ]?([0-9]{4})[- ]?([0-9]{4})$/.exec(switchFC);
        if (!switchcode) return sendMessage({ client: client, interaction: interaction, content: `Please specify a valid Nintendo Switch friend code.` });

        switchcode = `SW-${switchcode[1]}-${switchcode[2]}-${switchcode[3]}`;
        bank.currency.switchCode(interaction.member.id, switchcode);
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
        type: 3,
        description: "SW-1234-1234-1234"
    }]
};