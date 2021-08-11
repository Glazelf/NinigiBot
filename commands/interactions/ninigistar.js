exports.run = async (client, interaction, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');

        let message = await interaction.channel.messages.fetch(args[0]);
        if (!message) return;

        // Interaction only
        if (interaction.type == 'DEFAULT') return;

        try {
            await message.react('⭐');
        } catch (e) {
            console.log(e);
        };

        return sendMessage(client, interaction, `Starred ${message.author}'s message for you!`);

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