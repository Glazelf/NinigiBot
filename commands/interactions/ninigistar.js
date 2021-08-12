exports.run = async (client, interaction, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        // Interaction only
        if (interaction.type == 'DEFAULT') return;

        const sendMessage = require('../../util/sendMessage');

        let message = await interaction.channel.messages.fetch(args[0]);
        if (!message) return;

        let starReacts = await message.reactions.cache.filter(reaction => reaction.emoji.name == '⭐');
        console.log("Message: ---------------------------------------------------------")
        console.log(message)
        console.log(`message.reactions: -----------------------------------------------`)
        console.log(message.reactions.reactions)
        await message.reactions.cache.forEach(reaction => { console.log(reaction.emoji) })
        console.log("star reacts: -----------------------------------------------")
        console.log(starReacts)
        let reaction = await starReacts.me;
        console.log(`reactions: -----------------------------------------------`)
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