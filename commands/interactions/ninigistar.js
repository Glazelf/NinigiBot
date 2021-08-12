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

        let reactionData = {
            emoji: {
                name: '⭐'
            }
        };
        let botReacted = false;
        let messageReactionResolvable = new Discord.MessageReaction(client, reactionData, message);
        let reaction = await message.reactions.resolve(messageReactionResolvable);
        console.log(messageReactionResolvable == reaction);
        let reactionsBot = await reaction.users.fetch(client.user.id);

        await reactionsBot.forEach(reaction => {
            if (reaction.id == client.user.id) botReacted = true;
        });

        if (botReacted) {
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