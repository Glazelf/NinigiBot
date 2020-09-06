exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const { bank } = require('../../database/bank');
        const { Users, Equipments, Foods, KeyItems, Room, CurrencyShop } = require('../../database/dbObjects');
        const { Op } = require('sequelize');
        const shops = [Equipments, Foods, KeyItems, CurrencyShop];
        const input = message.content.slice(1).trim();
        const [, , commandArgs] = input.match(/(\w+)\s*([\s\S]*)/);
        for (let i = 0; i < shops.length; i++) {
            const item = await shops[i].findOne({ where: { name: { [Op.like]: commandArgs } } });
            if (item) {
                if (item.cost === 0) return message.channel.send(`> That item doesn't exist, ${message.author}.`);
                if (item.cost > bank.currency.getBalance(message.author.id)) {
                    return message.channel.send(`> You don't have enough currency, ${message.author}.
> The ${item.name} costs ${item.cost}💰 but you only have ${Math.floor(bank.currency.getBalance(message.author.id))}💰.`);
                };
                const user = await Users.findOne({ where: { user_id: message.author.id } });

                bank.currency.add(message.author.id, -item.cost);
                switch (i) {
                    case 0:
                        await user.addEquipment(item);
                        break;
                    case 1:
                        await user.addFood(item);
                        break;
                    case 2:
                        await user.addKey(item);
                        break;
                    case 3:
                        await user.addItem(item);
                        break;
                    // default:
                    //     await user.changeRoom(item);
                }

                return message.channel.send(`> You've bought a ${item.name}, ${message.author}.`);

            };
        };
        return message.channel.send(`> That item doesn't exist, ${message.author}.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};
