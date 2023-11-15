exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const api_user = require('../../database/dbServices/user.api');
        switch (interaction.options.getSubcommand()) {
            case "birthday":

                let day = interaction.options.getInteger("day");
                let month = interaction.options.getInteger("month");
                // Birthdays are stored as string DDMM instead of being seperated by a -
                if (day < 10) {
                    day = `0${day}`;
                } else {
                    day = `${day}`;
                };
                if (month < 10) {
                    month = `0${month}`;
                } else {
                    month = `${month}`;
                };
                api_user.setBirthday(interaction.user.id, day + month);
                return sendMessage({ client: client, interaction: interaction, content: `Updated your birthday to \`${day}-${month}\` (dd-mm).` });
                break;
            case "switch":
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
                break;
            case "ephemeral":
                // TODO
                break;
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "usersettings",
    description: "Change user settings.",
    options: [{
        name: "birthday",
        type: "SUB_COMMAND",
        description: "Update your birthday.",
        options: [{
            name: "day",
            type: "INTEGER",
            description: "Birth day of the month.",
            required: true,
            minValue: 1,
            maxValue: 31
        }, {
            name: "month",
            type: "INTEGER",
            description: "Birth month of the year.",
            required: true,
            minValue: 1,
            maxValue: 12
        }]
    }, {
        name: "switch",
        type: "SUB_COMMAND",
        description: "Updates your Switch friend code.",
        options: [{
            name: "switch-fc",
            type: "STRING",
            description: "Switch friend code. Example: SW-1234-1234-1234."
        }]
    }, {
        name: "ephemeral",
        type: "SUB_COMMAND",
        description: "Change ephemeral default.",
        options: [{
            name: "ephemeraldefault",
            type: "BOOLEAN",
            description: "New ephemeral default."
        }]
    }]
};