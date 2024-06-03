const Discord = require("discord.js");
exports.run = async (client, interaction, logger, ephemeral) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const user_api = require('../../database/dbServices/user.api');

        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg !== null) ephemeral = ephemeralArg;
        await interaction.deferReply({ ephemeral: ephemeral });

        let memberFetch = await interaction.guild.members.fetch();
        let global = false;
        let globalArg = interaction.options.getBoolean("global");
        if (globalArg === true) global = globalArg;
        const money_db = await user_api.getUsersRankedByMoney();
        const leaderboardEmbed = new Discord.EmbedBuilder()
            .setColor(client.globalVars.embedColor);
        if (global) {
            // Global leaderboard
            let leaderboardStringGlobal = money_db.filter(user => client.users.cache.has(user.user_id))
                .filter(user => !client.users.cache.get(user.user_id).bot)
                .slice(0, 10)
                .map((user, position) => `${position + 1}. ${(client.users.cache.get(user.user_id).username)}: ${Math.floor(user.money)}${client.globalVars.currency}`)
                .join('\n');
            leaderboardEmbed
                .setDescription(leaderboardStringGlobal)
                .setTitle(`Global Leaderboard:`);
        } else {
            // Server leaderboard
            let icon = interaction.guild.iconURL(client.globalVars.displayAvatarSettings);
            let leaderboardString = money_db.filter(user => client.users.cache.get(user.user_id) && memberFetch.get(user.user_id))
                .filter(user => !client.users.cache.get(user.user_id).bot)
                .slice(0, 10)
                .map((user, position) => `${position + 1}. ${(client.users.cache.get(user.user_id).username)}: ${Math.floor(user.money)}${client.globalVars.currency}`)
                .join('\n');
            if (leaderboardString.length < 1) return sendMessage({ client: client, interaction: interaction, content: "Noone in this server has any currency yet." });
            leaderboardEmbed
                .setDescription(leaderboardString)
                .setTitle(`Leaderboard:`)
                .setThumbnail(icon);
        };
        return sendMessage({ client: client, interaction: interaction, embeds: leaderboardEmbed, ephemeral: ephemeral });

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
        type: Discord.ApplicationCommandOptionType.Boolean,
        description: "Whether to showcase global leaderboard."
    }, {
        name: "ephemeral",
        type: Discord.ApplicationCommandOptionType.Boolean,
        description: "Whether the reply will be private."
    }]
};