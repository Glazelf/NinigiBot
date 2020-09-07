exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const { bank } = require('../../database/bank');
        let args = message.content.split(` `);

        if (args[1].toLowerCase() == "global") {
            return message.channel.send(
                bank.currency.sort((a, b) => b.balance - a.balance)
                    .filter(user => client.users.cache.has(user.user_id))
                    .first(10)
                    .map((user, position) => `(${position + 1}) ${(client.users.cache.get(user.user_id).tag)}: ${Math.floor(user.balance)}${globalVars.currency}`)
                    .join('\n'),
                { code: true }
            );
        } else {
            let memberFetch = await message.guild.members.fetch();
            return message.channel.send(
                bank.currency.sort((a, b) => b.balance - a.balance)
                    .filter(user => client.users.cache.get(user.user_id) && memberFetch.get(user.user_id))
                    .first(10)
                    .map((user, position) => `(${position + 1}) ${(client.users.cache.get(user.user_id).tag)}: ${Math.floor(user.balance)}${globalVars.currency}`)
                    .join('\n'),
                { code: true }
            )
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};
