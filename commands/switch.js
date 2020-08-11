module.exports.run = async (client, message) => {
    try {
        // Import globals
        let globalVars = require('../events/ready');

        const { bank } = require('../bank');
        const input = message.content.slice(1).trim();
        const [, , arguments] = input.match(/(\w+)\s*([\s\S]*)/);
        if (arguments.length<1) return message.channel.send('> Please specify a valid switch code');
        let switchcode = /^(?:SW)?-?([0-9]{4})-?([0-9]{4})-?([0-9]{4})$/.exec(arguments);
        if (!switchcode) return message.channel.send('> Please specify a valid switch code');
        switchcode = `SW-${switchcode[1]}-${switchcode[2]}-${switchcode[3]}`;
        bank.currency.switchCode(message.author.id, switchcode);
        return message.channel.send(`> Successfully updated your Nintendo Switch code.`)

    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
    };
};
