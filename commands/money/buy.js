const Discord = require("discord.js");
exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { bank } = require('../../database/bank');
        const { Users, Equipments, Foods, KeyItems, Room, CurrencyShop } = require('../../database/dbObjects');
        const { Op } = require('sequelize');
        const shops = [Equipments, Foods, KeyItems, CurrencyShop];

        let input = interaction.options.getString("item").toLowerCase();

        for (let i = 0; i < shops.length; i++) {
            const item = await shops[i].findOne({ where: { name: { [Op.like]: input } } });
            if (item) {
                if (item.cost === 0) return sendMessage({ client: client, interaction: interaction, content: `That item doesn't exist.` });
                let dbBalance = await bank.currency.getBalance(interaction.user.id);
                if (item.cost > dbBalance) {
                    return sendMessage({ client: client, interaction: interaction, content: `You don't have enough currency.\nThe ${item.name} costs ${item.cost}${globalVars.currency} but you only have ${Math.floor(dbBalance)}${globalVars.currency}.` });
                };
                const user = await Users.findOne({ where: { user_id: interaction.user.id } });
                if (!user) user = await Users.create({ user_id: interaction.user.id });

                bank.currency.add(interaction.user.id, -item.cost);
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

                return sendMessage({ client: client, interaction: interaction, content: `You bought a ${item.name} for ${item.cost}. You still have ${Math.floor(dbBalance - item.cost)}${globalVars.currency} left.` });
            };
        };
        return sendMessage({ client: client, interaction: interaction, content: `That item doesn't exist.` });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "buy",
    description: "Buy an item from the shop.",
    options: [{
        name: "item",
        type: Discord.ApplicationCommandOptionType.String,
        description: "The name of the item you want to buy.",
        required: true
    }]
};
