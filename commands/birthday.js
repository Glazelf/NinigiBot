module.exports.run = async (client, message) => {
    try {
        // Import globals
        let globalVars = require('../events/ready');

        const { bank } = require('../database/bank');
        const input = message.content.slice(1).trim();
        const [, , arguments] = input.match(/(\w+)\s*([\s\S]*)/);
        if (arguments.length<1) return message.channel.send(`> Please specify a valid birthday on dd-mm format, ${message.author}.`);
        let birthday = /^(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])(?:[- /.](19|20)\d\d)$/.exec(arguments);
        if (!birthday) return message.channel.send(`> Please specify a valid birthday on dd-mm format, ${message.author}.`);
        bank.currency.birthday(message.author.id, birthday[1]+birthday[2]);
        return message.channel.send(`> Successfully updated your birthday, ${message.author}.`)

    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
    };
};