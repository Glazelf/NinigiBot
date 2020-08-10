const {bank} = require('../bank');
const {Users, CurrencyShop} = require('../storeObjects');
const { Op } = require('sequelize');

exports.run = async (client, message) => {
    const input = message.content.slice(1).trim();
    const [, , commandArgs] = input.match(/(\w+)\s*([\s\S]*)/);
    const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: commandArgs } } });
    if (!item) return message.channel.send('That item doesn\'t exist.');
    if (item.cost > bank.currency.getBalance(message.author.id)) {
        return message.channel.send(`You don't have enough currency, ${message.author}`);
    }

    const user = await Users.findOne({ where: { user_id: message.author.id } });
    bank.currency.add(message.author.id, -item.cost);
    await user.addItem(item);

    message.channel.send(`You've bought a ${item.name}`);
};