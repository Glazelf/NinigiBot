exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const { bank } = require('../../database/bank');

        let memberFetch = await interaction.guild.members.fetch();
        let avatar = interaction.user.displayAvatarURL(globalVars.displayAvatarSettings);
        let global = false;
        let globalArg = interaction.options.getBoolean("global");
        if (globalArg === true) global = globalArg;

        const leaderboardEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor);

        // Global leaderboard
        if (global) {

            let leaderboardStringGlobal = bank.currency.sort((a, b) => b.balance - a.balance)
                .filter(user => client.users.cache.has(user.user_id))
                .filter(user => !client.users.cache.get(user.user_id).bot)
                .first(10)
                .map((user, position) => `${position + 1}. ${(client.users.cache.get(user.user_id).tag)}: ${Math.floor(user.balance)}${globalVars.currency}`)
                .join('\n');

            leaderboardEmbed
                .setDescription(leaderboardStringGlobal)
                .setAuthor({ name: `Global Leaderboard:`, iconURL: avatar });
        } else {
            avatar = interaction.guild.iconURL(globalVars.displayAvatarSettings);
            let leaderboardString = bank.currency.sort((a, b) => b.balance - a.balance)
                .filter(user => client.users.cache.get(user.user_id) && memberFetch.get(user.user_id))
                .filter(user => !client.users.cache.get(user.user_id).bot)
                .first(10)
                .map((user, position) => `${position + 1}. ${(client.users.cache.get(user.user_id).tag)}: ${Math.floor(user.balance)}${globalVars.currency}`)
                .join('\n');

            if (leaderboardString.length < 1) return sendMessage({ client: client, interaction: interaction, content: "Noone in this server has any currency yet." });

            leaderboardEmbed
                .setDescription(leaderboardString)
                .setAuthor({ name: `Leaderboard:`, iconURL: avatar });
        };

        return sendMessage({ client: client, interaction: interaction, embeds: leaderboardEmbed });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "leaderboard",
    description: "Displays money leaderboard.",
    options: [{
        name: "global",
        type: "BOOLEAN",
        description: "Whether to showcase global leaderboard."
    }]
};