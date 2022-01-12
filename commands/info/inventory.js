const Sequelize = require('sequelize');
const { Users } = require('../../database/dbObjects');

exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        //items, food, equipment
        let target;
        if (message.mentions && (message.mentions.members.size > 0 || message.mentions.repliedUser)) target = message.mentions.users.first();
        if (!target) target = message.member.user;

        let member;
        try {
            member = await message.guild.members.fetch(target.id);
        } catch (e) {
            // console.log(e);
            return sendMessage({ client: client, message: message, content: `No member information could be found for this user.` });
        };

        if (args[0] === 'items' || args[0] === 'food' || args[0] === 'equipment' || args[0] === 'keys' || !args[0]) {
            const user = await Users.findOne({ where: { user_id: target.id } });

            let items;

            // Display inventory per item category
            if (args[0] === 'food') {
                items = await user.getFoods();
                if (!items.length) return sendMessage({ client: client, message: message, content: `**${target.tag}** has no food!` });
                return sendMessage({ client: client, message: message, content: `${target.tag}'s food:\n ${items.map(t => `${t.amount} ${t.food.name}`).join(', ')}` });
            } else if (args[0] === 'equipment') {
                items = await user.getEquipments();
                if (!items.length) return sendMessage({ client: client, message: message, content: `**${target.tag}** has no equipment!` });
                return sendMessage({ client: client, message: message, content: `${target.tag}'s equipment:\n ${items.map(t => `${t.equipment.name}`).join(', ')}` });
            } else if (args[0] === 'keys') {
                items = await user.getKeys();
                if (!items.length) return sendMessage({ client: client, message: message, content: `**${target.tag}** has no key items!` });
                return sendMessage({ client: client, message: message, content: `${target.tag}'s key items:\n ${items.map(t => `${t.key.name}`).join(', ')}` });
            } else {
                let description = `**${target.tag}**'s inventory:`;
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
                if (description.length === length) if (!items.length) return sendMessage({ client: client, message: message, content: `**${target.tag}** has nothing!` });
                return sendMessage({ client: client, message: message, content: description });
            };
        };
        return sendMessage({ client: client, message: message, content: `Please specify a category: items, food or equipment.` });

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "inventory",
    aliases: ["inv", "items"],
    description: "Sends a list of items in your inventory."
};
