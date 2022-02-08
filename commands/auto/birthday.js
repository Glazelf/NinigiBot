exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { bank } = require('../../database/bank');

        let noBirthdayString = `Please specify a valid birthday in dd-mm format.`;

        // Check and sanitize birthday
        let date = args.find(element => element.name == "date");
        if (date) {
            date = date.value;
        } else {
            return sendMessage({ client: client, interaction: interaction, content: noBirthdayString });
        };
        let birthday = /^(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])/.exec(date);
        if (!birthday) return sendMessage({ client: client, interaction: interaction, content: noBirthdayString });

        bank.currency.birthday(interaction.member.id, birthday[1] + birthday[2]);
        return sendMessage({ client: client, interaction: interaction, content: `Successfully updated your birthday.` });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "birthday",
    description: "Updates your birthday",
    options: [{
        name: "date",
        type: "STRING",
        description: "Birthday in \"dd-mm\" format.",
        required: true
    }]
};