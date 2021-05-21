exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { bank } = require('../../database/bank');
        let args = message.content.split(` `);
        let memberFetch = await message.guild.members.fetch();

        if (args[1]) {
            if (args[1].toLowerCase() == "global") {
                return sendMessage(client, message,
                    bank.currency.sort((a, b) => b.balance - a.balance)
                        .filter(user => client.users.cache.has(user.user_id))
                        .first(10)
                        .map((user, position) => `(${position + 1}) ${(client.users.cache.get(user.user_id).tag)}: ${Math.floor(user.balance)}${globalVars.currency}`)
                        .join('\n'), true, [], true
                );
            } else if (args[1].toLowerCase() == "id" && message.author.id == client.config.ownerID) {
                return sendMessage(client, message,
                    bank.currency.sort((a, b) => b.balance - a.balance)
                        .filter(user => client.users.cache.has(user.user_id))
                        .first(10)
                        .map((user, position) => `(${position + 1}) ${(client.users.cache.get(user.user_id).tag)} (${(client.users.cache.get(user.user_id).id)}): ${Math.floor(user.balance)}${globalVars.currency}`)
                        .join('\n'), true, [], true
                );
            } else {
                serverLeaderboard();
            };
        } else {
            serverLeaderboard();
        };

        function serverLeaderboard() {
            return sendMessage(client, message,
                bank.currency.sort((a, b) => b.balance - a.balance)
                    .filter(user => client.users.cache.get(user.user_id) && memberFetch.get(user.user_id))
                    .first(10)
                    .map((user, position) => `(${position + 1}) ${(client.users.cache.get(user.user_id).tag)}: ${Math.floor(user.balance)}${globalVars.currency}`)
                    .join('\n'), true, [], true
            );
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