exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { bank } = require('../../database/bank');
        const { Users, Equipments, Foods, KeyItems, Room, CurrencyShop } = require('../../database/dbObjects');
        const { Op } = require('sequelize');
        const shops = [Equipments, Foods, KeyItems, CurrencyShop];

        if (message.member.id !== client.config.ownerID) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        // Target finding can be optimized later, but it's an owner-only command so this has very low priority
        let target;
        if (message.mentions && (message.mentions.members.size > 0 || message.mentions.repliedUser)) {
            const expectedId = /<@!(\d+)/.exec(args[0]);
            const targetId = message.mentions.members.first().id;
            if (expectedId && expectedId[1] == targetId) {
                target = message.mentions.members.first().user;
                args.splice(0, 1);
            } else return sendMessage({ client: client, interaction: interaction, content: `The syntax is \`/item <target> <item name>\`.` }); // God I dread having to rewrite these commands
        } else {
            target = message.member.user;
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
                            return sendMessage({ client: client, interaction: interaction, content: `Removed ${itemName} from ${target}!` });
                        } else {
                            await user.addEquipment(item);
                            return sendMessage({ client: client, interaction: interaction, content: `Added ${itemName} to ${target}!` });
                        };
                    };
                    await user.addEquipment(item);
                    return sendMessage({ client: client, interaction: interaction, content: `Added ${itemName} to ${target}!` });

                } else if (i === 1) {
                    const foods = await user.getFoods();
                    if (foods) {
                        const food = foods.filter(i => i.food.name.toLowerCase() === itemName.toLowerCase());
                        if (food.length >= 1) {
                            await user.removeFood(item)
                            return sendMessage({ client: client, interaction: interaction, content: `Removed ${itemName} from ${target}!` });
                        } else {
                            await user.addFood(item);
                            return sendMessage({ client: client, interaction: interaction, content: `Added ${itemName} to ${target}!` });
                        };
                    };
                    await user.addFood(item);
                    return sendMessage({ client: client, interaction: interaction, content: `Added ${itemName} to ${target}!` });

                } else if (i === 2) {
                    const keys = await user.getKeys();
                    if (keys) {
                        const key = keys.filter(i => i.key.name.toLowerCase() === itemName.toLowerCase());
                        if (key.length >= 1) {
                            await user.removeKey(item)
                            return sendMessage({ client: client, interaction: interaction, content: `Removed ${itemName} from ${target}!` });
                        } else {
                            await user.addKey(item);
                            return sendMessage({ client: client, interaction: interaction, content: `Added ${itemName} to ${target}!` });
                        };
                    };
                    await user.addKey(item);
                    return sendMessage({ client: client, interaction: interaction, content: `Added ${itemName} to ${target}!` });

                } else if (i === 3) {
                    const items = await user.getItems();
                    if (items) {
                        const item = items.filter(i => i.item.name.toLowerCase() === itemName.toLowerCase());
                        if (item.length >= 1) {
                            await user.removeItem(item)
                            return sendMessage({ client: client, interaction: interaction, content: `Removed ${itemName} from ${target}!` });
                        } else {
                            await user.addItem(item);
                            return sendMessage({ client: client, interaction: interaction, content: `Added ${itemName} to ${target}!` });
                        };
                    };
                    await user.addItem(item);
                    return sendMessage({ client: client, interaction: interaction, content: `Added ${itemName} to ${target}!` });
                }/* else{
                    await user.changeRoom(item);
                    
                } */

                return sendMessage({ client: client, interaction: interaction, content: `You've bought a ${item.name}.` });

            };
        };
        return sendMessage({ client: client, interaction: interaction, content: `That item doesn't exist.` });


    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "item",
    description: "Use an item on someone.",
    defaultPermission: false,
    permission: "owner",
    options: [{
        name: "user",
        type: 6,
        description: "Specify user."
    }, {
        name: "item",
        type: 3,
        description: "Item to use.",
    }]
};
