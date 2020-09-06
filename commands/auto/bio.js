module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const { bank } = require('../../database/bank');
        const input = message.content.slice(1).trim();
        const [, , biography] = input.match(/(\w+)\s*([\s\S]*)/);

        if (!biography) return message.channel.send(`> Please specify a valid biography, ${message.author}.`);

        bank.currency.biography(message.author.id, biography);

        return message.channel.send(`> Successfully updated your biography, ${message.author}.`)

    } catch (e) {
        // log error
        let { logger } = require('../../events/ready');
        logger(e, message.channel);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command. The error has already been logged, but please also report this as an issue on the Github page or send a message to Glaze#6669. For links and other information use ${globalVars.prefix}info.`);
    };
};