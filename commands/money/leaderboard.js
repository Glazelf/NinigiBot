exports.run = async (client, message, args = []) => {
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
            .setFooter(author.tag)
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
                    .setAuthor(`Global Leaderboard:`, avatar);

                // Leaderboard with IDs
            } else if (args[0].toLowerCase() == "id" && message.member.id == client.config.ownerID) {
                let leaderboardStringID = bank.currency.sort((a, b) => b.balance - a.balance)
                    .filter(user => client.users.cache.has(user.user_id))
                    .first(10)
                    .map((user, position) => `${position + 1}. ${(client.users.cache.get(user.user_id).tag)}: ${Math.floor(user.balance)}${globalVars.currency} (${(client.users.cache.get(user.user_id).id)})`)
                    .join('\n');

                leaderboardEmbed
                    .setDescription(leaderboardStringID)
                    .setAuthor(`ID Leaderboard:`, avatar);

            } else {
                serverLB();
            };
        } else {
            serverLB();
        };

        return sendMessage(client, message, null, leaderboardEmbed);

        function serverLB() {
            let leaderboardString = bank.currency.sort((a, b) => b.balance - a.balance)
                .filter(user => client.users.cache.get(user.user_id) && memberFetch.get(user.user_id))
                .filter(user => !client.users.cache.get(user.user_id).bot)
                .first(10)
                .map((user, position) => `${position + 1}. ${(client.users.cache.get(user.user_id).tag)}: ${Math.floor(user.balance)}${globalVars.currency}`)
                .join('\n');

            if (leaderboardString.length < 1) return sendMessage(client, message, "Noone in this server has any currency yet.");

            leaderboardEmbed
                .setDescription(leaderboardString)
                .setAuthor(`Leaderboard:`, avatar);
        };

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "leaderboard",
    aliases: ["lb"],
    description: "Displays money leaderboard."
};