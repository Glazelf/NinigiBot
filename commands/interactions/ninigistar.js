exports.run = async (client, interaction, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        console.log(interaction)
        console.log(message)
        // Interaction only
        if (interaction.type == 'DEFAULT') return;

        try {
            await message.react('⭐');
        } catch (e) {
            console.log(e);
        };

        return sendMessage(client, interaction, `Starred this message for you!`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "Ninigi Star",
    type: "MESSAGE"
};