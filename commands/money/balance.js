exports.run = (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const { bank } = require('../../database/bank');
        let target = message.mentions.users.first();

        if (!target) {
            const input = message.content.split(` `, 2);
            let userID = input[1];
            target = client.users.cache.get(userID);
        };

        if (!target) {
            target = message.author;
        };

        return message.channel.send(`> ${target.tag} has ${Math.floor(bank.currency.getBalance(target.id))}${globalVars.currency}.`);

    } catch (e) {
        // log error
        let {logger} = require('../../events/ready');
        logger(e, message.channel);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command. The error has already been logged, but please also report this as an issue on the Github page or send a message to Glaze#6669. For links and other information use ${globalVars.prefix}info.`);
    };
};