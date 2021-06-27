exports.run = async (client, message, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const { bank } = require('../../database/bank');

        let memberFetch = await message.guild.members.fetch();
        let avatar = message.member.user.displayAvatarURL({ format: "png", dynamic: true });

        const leaderboardEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(`Currency leaderboard:`, avatar)
            .setFooter(message.member.user.tag)
            .setTimestamp();

        if (args[0]) {
            if (args[0].toLowerCase() == "global") {
                let leaderboardStringGlobal = bank.currency.sort((a, b) => b.balance - a.balance)
                    .filter(user => client.users.cache.has(user.user_id))
                    .filter(user => !client.users.cache.get(user.user_id).bot)
                    .first(10)
                    .map((user, position) => `${position + 1}. ${(client.users.cache.get(user.user_id).tag)}: ${Math.floor(user.balance)}${globalVars.currency}`)
                    .join('\n');

                leaderboardEmbed.setDescription(leaderboardStringGlobal);

            } else if (args[0].toLowerCase() == "id" && message.member.id == client.config.ownerID) {
                let leaderboardStringID = bank.currency.sort((a, b) => b.balance - a.balance)
                    .filter(user => client.users.cache.has(user.user_id))
                    .first(10)
                    .map((user, position) => `${position + 1}. ${(client.users.cache.get(user.user_id).tag)}: ${Math.floor(user.balance)}${globalVars.currency} (${(client.users.cache.get(user.user_id).id)})`)
                    .join('\n');

                leaderboardEmbed.setDescription(leaderboardStringID);

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

            leaderboardEmbed.setDescription(leaderboardString);
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "leaderboard",
    aliases: ["lb"],
    description: "Displays money leaderboard."
};