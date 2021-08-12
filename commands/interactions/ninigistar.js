exports.run = async (client, interaction, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        // Interaction only
        if (interaction.type == 'DEFAULT') return;

        const sendMessage = require('../../util/sendMessage');

        let message = await interaction.channel.messages.fetch(args[0]);
        if (!message) return;

        let reaction = null;
        const filter = (reaction, user) => reaction.emoji.name == '⭐' && user.id == client.user.id;
        await message.awaitReactions({ filter }).then(collected => {
            if (collected.size > 0) reaction = collected[0];
        }).catch(console.log(error));
        console.log(reaction)

        if (reaction) {
            await reaction.remove();
            return sendMessage(client, interaction, `Unstarred ${message.author}'s message for you! (${message.url})`);
        } else {
            await message.react('⭐');
            return sendMessage(client, interaction, `Starred ${message.author}'s message for you! (${message.url})`);
        };

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