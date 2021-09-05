exports.run = async (client, interaction, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        // Interaction only
        if (interaction.type == 'DEFAULT') return;

        const Discord = require('discord.js');
        const sendMessage = require('../../util/sendMessage');

        let message = await interaction.channel.messages.fetch(args[0]);
        if (!message) return;

        // Check if bot has reacted
        let botReacted = false;
        let reactionData = {
            me: true,
            emoji: {
                name: '⭐'
            }
        };
        let messageReactions = new Discord.MessageReaction(client, reactionData, message);
        let starReactions = await messageReactions.users.fetch();
        starReactions.forEach(reaction => {
            if (reaction.id == client.user.id) botReacted = true;
        });

        // If bot reacted, remove. If not, react.
        if (botReacted) {
            await messageReactions.users.remove(client.user);
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