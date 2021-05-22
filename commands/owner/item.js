exports.run = async (client, message, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { bank } = require('../../database/bank');
        const { Users, Equipments, Foods, KeyItems, Room, CurrencyShop } = require('../../database/dbObjects');
        const { Op } = require('sequelize');
        const shops = [Equipments, Foods, KeyItems, CurrencyShop];

        if (message.author.id !== client.config.ownerID) return sendMessage(client, message, globalVars.lackPerms);

        // Target finding can be optimized later, but it's an owner-only command so this has very low priority
        let target;
        if (message.mentions.members.first()) {
            const expectedId = /<@!(\d+)/.exec(args[0]);
            const targetId = message.mentions.members.first().id;
            if (expectedId && expectedId[1] == targetId) {
                target = message.mentions.members.first().user;
                args.splice(0, 1);
            } else return sendMessage(client, message, `The syntax is \`${prefix}item <target> <item name>\`.`);
        } else {
            target = message.author;
        };
        const itemName = args.join(' ')
        for (let i = 0; i < shops.length; i++) {
            const item = await shops[i].findOne({ where: { name: { [Op.like]: itemName } } });
            if (item) {
                const user = await Users.findOne({ where: { user_id: target.id } });
                if (i === 0) {
                    const equipments = await user.getEquipments();
                    if (equipments) {
                        const equipment = equipments.filter(i => i.equipment.name.toLowerCase() === itemName.toLowerCase());
                        if (equipment.length >= 1) {
                            await user.removeEquipment(item)
                            return sendMessage(client, message, `Removed ${itemName} from ${target}!`);
                        } else {
                            await user.addEquipment(item);
                            return sendMessage(client, message, `Added ${itemName} to ${target}!`);
                        };
                    };
                    await user.addEquipment(item);
                    return sendMessage(client, message, `Added ${itemName} to ${target}!`);

                } else if (i === 1) {
                    const foods = await user.getFoods();
                    if (foods) {
                        const food = foods.filter(i => i.food.name.toLowerCase() === itemName.toLowerCase());
                        if (food.length >= 1) {
                            await user.removeFood(item)
                            return sendMessage(client, message, `Removed ${itemName} from ${target}!`);
                        } else {
                            await user.addFood(item);
                            return sendMessage(client, message, `Added ${itemName} to ${target}!`);
                        };
                    };
                    await user.addFood(item);
                    return sendMessage(client, message, `Added ${itemName} to ${target}!`);

                } else if (i === 2) {
                    const keys = await user.getKeys();
                    if (keys) {
                        const key = keys.filter(i => i.key.name.toLowerCase() === itemName.toLowerCase());
                        if (key.length >= 1) {
                            await user.removeKey(item)
                            return sendMessage(client, message, `Removed ${itemName} from ${target}!`);
                        } else {
                            await user.addKey(item);
                            return sendMessage(client, message, `Added ${itemName} to ${target}!`);
                        };
                    };
                    await user.addKey(item);
                    return sendMessage(client, message, `Added ${itemName} to ${target}!`);

                } else if (i === 3) {
                    const items = await user.getItems();
                    if (items) {
                        const item = items.filter(i => i.item.name.toLowerCase() === itemName.toLowerCase());
                        if (item.length >= 1) {
                            await user.removeItem(item)
                            return sendMessage(client, message, `Removed ${itemName} from ${target}!`);
                        } else {
                            await user.addItem(item);
                            return sendMessage(client, message, `Added ${itemName} to ${target}!`);
                        };
                    };
                    await user.addItem(item);
                    return sendMessage(client, message, `Added ${itemName} to ${target}!`);
                }/* else{
                    await user.changeRoom(item);
                    
                } */

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
    name: "item",
    aliases: [],
    description: "Use an item on someone.",
    options: [{
        name: "user-mention",
        type: "MENTIONABLE",
        description: "Specify user by mention."
    }, {
        name: "user-id",
        type: "STRING",
        description: "Specify user by id."
    }, {
        name: "item",
        type: "STRING",
        description: "Item to use.",
    }]
};
