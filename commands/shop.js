const {CurrencyShop} = require('../storeObjects');

exports.run = async (client, message) => {
    const items = await CurrencyShop.findAll();
    return message.channel.send(items.map(i => `${i.name}: ${i.cost}💰`).join('\n'), { code: true });
};