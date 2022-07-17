const Discord = require("discord.js");
const Sequelize = require('sequelize');
const { Users } = require('../../database/dbObjects');
exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');

        let ephemeral = true;
        await interaction.deferReply({ ephemeral: ephemeral });
        let inventoryCat = interaction.options.getString("category").toLowerCase();

        if (inventoryCat === 'items' || inventoryCat === 'food' || inventoryCat === 'equipment' || inventoryCat === 'keys' || !inventoryCat) {
            const user = await Users.findOne({ where: { user_id: interaction.user.id } });
            if (!user) user = await Users.create({ user_id: interaction.user.id });
            let items;
            // Display inventory per item category. Should make this into one scrollable embed someday.
            if (inventoryCat === 'food') {
                items = await user.getFoods();
                if (!items.length) return sendMessage({ client: client, interaction: interaction, content: `${interaction.user.username} has no food!` });
                return sendMessage({ client: client, interaction: interaction, content: `${interaction.user.username}'s food:\n${items.map(t => `${t.amount} ${t.food.name}`).join(', ')}` });
            } else if (inventoryCat === 'equipment') {
                items = await user.getEquipments();
                if (!items.length) return sendMessage({ client: client, interaction: interaction, content: `${interaction.user.username} has no equipment!` });
                return sendMessage({ client: client, interaction: interaction, content: `${interaction.user.username}'s equipment:\n${items.map(t => `${t.equipment.name}`).join(', ')}` });
            } else if (inventoryCat === 'key') {
                items = await user.getKeys();
                if (!items.length) return sendMessage({ client: client, interaction: interaction, content: `${interaction.user.username} has no key items!` });
                return sendMessage({ client: client, interaction: interaction, content: `${interaction.user.username}'s key items:\n${items.map(t => `${t.key.name}`).join(', ')}` });
            } else {
                let description = `**${interaction.user.username}**'s inventory:`;
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
                if (description.length === length) if (!items.length) return sendMessage({ client: client, interaction: interaction, content: `${interaction.user.username} has nothing!` });
                return sendMessage({ client: client, interaction: interaction, content: description });
            };
        };
        return sendMessage({ client: client, interaction: interaction, content: `Please specify a category: \`food\`, \`equipment\` or \`key\`.` });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "inventory",
    description: "Sends a list of items in your inventory.",
    options: [{
        name: "category",
        type: "STRING",
        description: "Specify the inventory category. Food, equipment or key.",
        required: true
    }]
};
