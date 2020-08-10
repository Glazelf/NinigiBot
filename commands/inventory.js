const {Users} = require('../storeObjects');

exports.run = async (client, message) => {
    const target = message.mentions.users.first() || message.author;
    const user = await Users.findOne({ where: { user_id: target.id } });
    const items = await user.getItems();

    if (!items.length) return message.channel.send(`${target.toString()} has nothing!`);
    return message.channel.send(`${target.toString()} currently has ${items.map(t => `${t.amount} ${t.item.name}`).join(', ')}`);
};