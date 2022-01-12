exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const { bank } = require('../../database/bank');

        let memberFetch = await message.guild.members.fetch();

        let author = message.member.user;

        let avatar = author.displayAvatarURL(globalVars.displayAvatarSettings);

        const leaderboardEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setFooter({ text: author.tag })
            .setTimestamp();

        if (args[0]) {
            // Global leaderboard
            if (args[0].toLowerCase() == "global") {
                let leaderboardStringGlobal = bank.currency.sort((a, b) => b.balance - a.balance)
                    .filter(user => client.users.cache.has(user.user_id))
                    .filter(user => !client.users.cache.get(user.user_id).bot)
                    .first(10)
                    .map((user, position) => `${position + 1}. ${(client.users.cache.get(user.user_id).tag)}: ${Math.floor(user.balance)}${globalVars.currency}`)
                    .join('\n');

                leaderboardEmbed
                    .setDescription(leaderboardStringGlobal)
                    .setAuthor({ name: `Global Leaderboard:`, iconURL: avatar });

                // Leaderboard with IDs
            } else if (args[0].toLowerCase() == "id" && message.member.id == client.config.ownerID) {
                let leaderboardStringID = bank.currency.sort((a, b) => b.balance - a.balance)
                    .filter(user => client.users.cache.has(user.user_id))
                    .first(10)
                    .map((user, position) => `${position + 1}. ${(client.users.cache.get(user.user_id).tag)}: ${Math.floor(user.balance)}${globalVars.currency} (${(client.users.cache.get(user.user_id).id)})`)
                    .join('\n');

                leaderboardEmbed
                    .setDescription(leaderboardStringID)
                    .setAuthor({ name: `ID Leaderboard:`, iconURL: avatar });

            } else {
                serverLB();
            };
        } else {
            serverLB();
        };

        return sendMessage({ client: client, message: message, embeds: leaderboardEmbed });

        function serverLB() {
            let leaderboardString = bank.currency.sort((a, b) => b.balance - a.balance)
                .filter(user => client.users.cache.get(user.user_id) && memberFetch.get(user.user_id))
                .filter(user => !client.users.cache.get(user.user_id).bot)
                .first(10)
                .map((user, position) => `${position + 1}. ${(client.users.cache.get(user.user_id).tag)}: ${Math.floor(user.balance)}${globalVars.currency}`)
                .join('\n');

            if (leaderboardString.length < 1) return sendMessage({ client: client, message: message, content: "Noone in this server has any currency yet." });

            leaderboardEmbed
                .setDescription(leaderboardString)
                .setAuthor({ name: `Leaderboard:`, iconURL: avatar });
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "leaderboard",
    description: "Displays money leaderboard."
};