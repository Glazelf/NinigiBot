exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const { CurrencyShop } = require('../../database/dbObjects');
        const items = await CurrencyShop.findAll();
        return message.channel.send(items.map(i => `${i.name}: ${i.cost}💰`).join('\n'), { code: true });
    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${globalVars.prefix}info.`);
    };
};