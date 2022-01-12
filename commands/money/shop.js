const Sequelize = require('sequelize');
const { ne } = Sequelize.Op;

exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const { Equipments, Foods, KeyItems, Room, CurrencyShop } = require('../../database/dbObjects');
        // Make subcommands for the different shops
        if (!args[0]) return sendMessage(client, message, failString);

        const input = args[0].toLowerCase();
        const condition = { where: { cost: { [ne]: 0 } } };
        // Lottery Tickets are messed up and temporarily removed, so items is empty
        /*if (input == 'items') {
            const items = await CurrencyShop.findAll(condition);
            let returnString = Discord.Formatters.codeBlock(true, items.map(i => i.toString()).join('\n'));
            return sendMessage(client, message, returnString);
        }*/ if (input == 'equipment') {
            const items = await Equipments.findAll(condition);
            let returnString = Discord.Formatters.codeBlock(true, items.map(i => i.toString()).join('\n'));
            return sendMessage(client, message, returnString);
        } if (input == 'food') {
            const items = await Foods.findAll(condition);
            let returnString = Discord.Formatters.codeBlock(true, items.map(i => i.toString()).join('\n'));
            return sendMessage(client, message, returnString);
        }; // Coming soon, maybe
        /* if(input == 'key'){
            const items = await KeyItems.findAll(condition);
            let returnString = Discord.Formatters.codeBlock(true, items.map(i => i.toString()).join('\n'));
            return sendMessage(client, message, returnString);
        } *//* if(input == 'rooms'){
            const items = await Room.findAll(condition);
            let returnString = Discord.Formatters.codeBlock(true, items.map(i => i.toString()).join('\n'));
            return sendMessage(client, message, returnString);
        } */
        return sendMessage(client, message, failString);

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "shop",
    description: "Displays items in the shop.",
    options: [{
        name: "equipment",
        type: "SUB_COMMAND",
        description: "Equipment shop."
    }, {
        name: "food",
        type: "SUB_COMMAND",
        description: "Food shop."
    }]
};