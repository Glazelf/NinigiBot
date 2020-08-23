exports.run = (client, message) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {
        const { bank } = require('../database/bank');
        let target = message.mentions.users.first();

        if (!target) {
            const input = message.content.split(` `, 2);
            let userID = input[1];
            target = client.users.cache.get(userID);
        };

        if (!target) {
            target = message.author;
        };

        return message.channel.send(`> ${target.tag} has ${Math.floor(bank.currency.getBalance(userCache.id))}💰.`);

    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${globalVars.prefix}info.`);
    };
};