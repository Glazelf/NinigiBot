exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const api_user = require('../../database/dbServices/user.api');

        let ephemeral = true;
        await interaction.deferReply({ ephemeral: ephemeral });
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

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "birthday",
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
};