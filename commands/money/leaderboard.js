exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const user_api = require('../../database/dbServices/user.api');

        let ephemeral = true;
        await interaction.deferReply({ ephemeral: ephemeral });

        let memberFetch = await interaction.guild.members.fetch();
        let global = false;
        let globalArg = interaction.options.getBoolean("global");
        if (globalArg === true) global = globalArg;
        let icon = null;
        const money_db = await user_api.getUsersRankedByMoney();
        const leaderboardEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor);

        if (global) {
            // Global leaderboard
            icon = client.user.displayAvatarURL(globalVars.displayAvatarSettings);
            let leaderboardStringGlobal = money_db.filter(user => client.users.cache.has(user.user_id))
                .filter(user => !client.users.cache.get(user.user_id).bot)
                .slice(0, 10)
                .map((user, position) => `${position + 1}. ${(client.users.cache.get(user.user_id).username)}: ${Math.floor(user.money)}${globalVars.currency}`)
                .join('\n');

            leaderboardEmbed
                .setDescription(leaderboardStringGlobal)
                .setAuthor({ name: `Global Leaderboard:`, iconURL: icon });
        } else {
            // Server leaderboard
            icon = interaction.guild.iconURL(globalVars.displayAvatarSettings);
            let leaderboardString = money_db.filter(user => client.users.cache.get(user.user_id) && memberFetch.get(user.user_id))
                .filter(user => !client.users.cache.get(user.user_id).bot)
                .slice(0, 10)
                .map((user, position) => `${position + 1}. ${(client.users.cache.get(user.user_id).username)}: ${Math.floor(user.money)}${globalVars.currency}`)
                .join('\n');

            if (leaderboardString.length < 1) return sendMessage({ client: client, interaction: interaction, content: "Noone in this server has any currency yet." });

            leaderboardEmbed
                .setDescription(leaderboardString)
                .setAuthor({ name: `Leaderboard:`, iconURL: icon });
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