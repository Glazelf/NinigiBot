const Sequelize = require('sequelize');
const { ne } = Sequelize.Op;
exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const { Equipments, Foods, KeyItems, Room, CurrencyShop } = require('../../database/dbObjects');
        const input = message.content.slice(1).trim();
        const [, , biography] = input.match(/(\w+)\s*([\s\S]*)/);
        const condition = { where: { cost: { [ne]: 0 } } };
        if (biography === 'items') {
            const items = await CurrencyShop.findAll(condition);
            return message.channel.send(items.map(i => i.toString()).join('\n'), { code: true });
        } if (biography === 'equipment') {
            const items = await Equipments.findAll(condition);
            return message.channel.send(items.map(i => i.toString()).join('\n'), { code: true });
        } if (biography === 'food') {
            const items = await Foods.findAll(condition);
            return message.channel.send(items.map(i => i.toString()).join('\n'), { code: true });
        }/* if(biography === 'key'){
            const items = await KeyItems.findAll(condition);
            return message.channel.send(items.map(i => i.toString()).join('\n'), { code: true });
        } *//* if(biography === 'rooms'){
            const items = await Room.findAll(condition);
            return message.channel.send(items.map(i => i.toString()).join('\n'), { code: true });
        } */
        return message.channel.send(`That is not an existing shop. Please use \`${globalVars.prefix}shop\` followed by a category: items, equipment, food`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports = {
    name: "shop",
    aliases: ["store"]
};