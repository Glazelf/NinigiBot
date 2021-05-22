const Sequelize = require('sequelize');
const { Users } = require('../../database/dbObjects');

exports.run = async (client, message, args = []) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        //items, food, equipment
        const target = message.mentions.users.first() || message.author;

        if (args[0] === 'items' || args[0] === 'food' || args[0] === 'equipment' || args[0] === 'keys' || !args[0]) {
            const user = await Users.findOne({ where: { user_id: target.id } });

            let items;

            if (args[0] === 'food') {
                items = await user.getFoods();
                if (!items.length) return sendMessage(client, message, `${target.toString()} has no food!`);
                return sendMessage(client, message, `${target.toString()}'s food:\n ${items.map(t => `${t.amount} ${t.food.name}`).join(', ')}`);
            } else if (args[0] === 'equipment') {
                items = await user.getEquipments();
                if (!items.length) return sendMessage(client, message, `${target.toString()} has no equipment!`);
                return sendMessage(client, message, `${target.toString()}'s equipment:\n ${items.map(t => `${t.equipment.name}`).join(', ')}`);
            } else if (args[0] === 'keys') {
                items = await user.getKeys();
                if (!items.length) return sendMessage(client, message, `${target.toString()} has no key items!`);
                return sendMessage(client, message, `${target.toString()}'s key items:\n ${items.map(t => `${t.key.name}`).join(', ')}`);
            } else {
                let description = `${target.toString()}'s inventory:`;
                const length = description.length;
                items = await user.getItems();
                let itemsInventoryText = `${items.map(t => {
                    if (t.item) {
                        `${t.amount} ${t.item.name}`
                    }
                })}`;
                if (items.length && itemsInventoryText.length) description += `\n**Items**\n` + itemsInventoryText;
                items = await user.getFoods();
                if (items.length) description += `\n**Food**\n${items.map(t => `${t.amount} ${t.food.name}`)}`;
                items = await user.getEquipments();
                if (items.length) description += `\n**Equipment**\n${items.map(t => `${t.equipment.name}`)}`;
                items = await user.getKeys();
                if (items.length) description += `\n**Key items**\n${items.map(t => `${t.key.name}`)}`;
                if (description.length === length) if (!items.length) return sendMessage(client, message, `${target.toString()} has nothing!`);
                return sendMessage(client, message, description);
            };
        };
        return sendMessage(client, message, `Please specify a category: items, food or equipment.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "inventory",
    aliases: ["inv", "items"],
    description: "Sends a list of items in your inventory."
};
