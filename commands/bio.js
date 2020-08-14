module.exports.run = async (client, message) => {
    try {
        // Import globals
        let globalVars = require('../events/ready');

        const { bank } = require('../database/bank');
        const input = message.content.slice(1).trim();
        const [, , biography] = input.match(/(\w+)\s*([\s\S]*)/);

        if (!biography) return message.channel.send(`> Please specify a valid biography, ${message.author}.`);

        bank.currency.biography(message.author.id, biography);

        return message.channel.send(`> Successfully updated your biography, ${message.author}.`)

    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
    };
};