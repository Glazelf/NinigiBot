exports.run = async (client, interaction, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        // Interaction only
        if (interaction.type == 'DEFAULT') return;

        const sendMessage = require('../../util/sendMessage');

        let message = await interaction.channel.messages.fetch(args[0]);
        if (!message) return;

        let reaction = await message.reaction.cache.find(reaction => reaction.emoji == '⭐' && reaction.me);
        try {
            if (reaction) {
                await reaction.remove();
            } else {
                await message.react('⭐');
            };
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