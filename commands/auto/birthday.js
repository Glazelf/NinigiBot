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
        let date = `${day}-${month}`;

        // Check and sanitize birthday
        let birthday = /^(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])/.exec(date);
        if (!birthday) return sendMessage({ client: client, interaction: interaction, content: `Please specify a valid birthday in dd-mm format.` });
        api_user.setBirthday(interaction.user.id, birthday[1] + birthday[2]);
        return sendMessage({ client: client, interaction: interaction, content: `Updated your birthday to \`${date}\` (dd-mm).` });

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
        required: true
    }, {
        name: "month",
        type: "INTEGER",
        description: "Birth month of the year.",
        required: true
    }]
};