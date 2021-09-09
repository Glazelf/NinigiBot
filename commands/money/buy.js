exports.run = async (client, message, args = [], language) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const getLanguageString = require('../../util/getLanguageString');
        const { bank } = require('../../database/bank');
        const { Users, Equipments, Foods, KeyItems, Room, CurrencyShop } = require('../../database/dbObjects');
        const { Op } = require('sequelize');
        const shops = [Equipments, Foods, KeyItems, CurrencyShop];

        // Disable because bugs
        return sendMessage(client, message, `Buying is currently experiencing some bugs and has been disabled. For  more info: <https://github.com/Glazelf/NinigiBot/issues/132>.`);

        if (!args[0]) return sendMessage(client, message, `You need to provide the name of the item you want to buy.`);
        const commandArgs = args[0].match(/(\w+)\s*([\s\S]*)/);
        for (let i = 0; i < shops.length; i++) {
            const item = await shops[i].findOne({ where: { name: { [Op.like]: commandArgs } } });
            if (item) {
                if (item.cost === 0) return sendMessage(client, message, `That item doesn't exist.`);
                let dbBalance = await bank.currency.getBalance(message.member.id);
                if (item.cost > dbBalance) {
                    return sendMessage(client, message, `You don't have enough currency.\nThe ${item.name} costs ${item.cost}${globalVars.currency} but you only have ${Math.floor(dbBalance)}${globalVars.currency}.`);
                };
                const user = await Users.findOne({ where: { user_id: message.member.id } });

                bank.currency.add(message.member.id, -item.cost);
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

                return sendMessage(client, message, `You've bought a ${item.name}.`);
            };
        };
        return sendMessage(client, message, `That item doesn't exist.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "buy",
    aliases: [],
    description: "Buy an item from the shop.",
    optiosn: [{
        name: "item-name",
        type: "STRING",
        description: "The name of the item you want to buy.",
        required: true
    }]
};
