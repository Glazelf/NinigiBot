const Sequelize = require('sequelize');
const { ne } = Sequelize.Op;

const Discord = require("discord.js");
exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { Equipments, Foods, KeyItems, Room, CurrencyShop, Prefixes } = require('../../database/dbObjects');
        let prefix = await Prefixes.findOne({ where: { server_id: message.guild.id } });
        if (prefix) {
            prefix = prefix.prefix;
        } else {
            prefix = globalVars.prefix;
        };

        let failString = `That is not an existing shop. Please use \`${prefix}shop\` followed by a category: equipment, food.`;
        if (!args[0]) return sendMessage({ client: client, message: message, content: failString });

        const input = args[0].toLowerCase();
        const condition = { where: { cost: { [ne]: 0 } } };
        // Lottery Tickets are messed up and temporarily removed, so items is empty
        /*if (input == 'items') {
            const items = await CurrencyShop.findAll(condition);
            let returnString = Discord.Formatters.codeBlock(true, items.map(i => i.toString()).join('\n'));
            return sendMessage({client: client, message: message, content: returnString });
        }*/ if (input == 'equipment') {
            const items = await Equipments.findAll(condition);
            let returnString = Discord.Formatters.codeBlock(true, items.map(i => i.toString()).join('\n'));
            return sendMessage({ client: client, message: message, content: returnString });
        } if (input == 'food') {
            const items = await Foods.findAll(condition);
            let returnString = Discord.Formatters.codeBlock(true, items.map(i => i.toString()).join('\n'));
            return sendMessage({ client: client, message: message, content: returnString });
        }; // Coming soon, maybe
        /* if(input == 'key'){
            const items = await KeyItems.findAll(condition);
            let returnString = Discord.Formatters.codeBlock(true, items.map(i => i.toString()).join('\n'));
            return sendMessage({client: client, message: message, content: returnString });
        } *//* if(input == 'rooms'){
            const items = await Room.findAll(condition);
            let returnString = Discord.Formatters.codeBlock(true, items.map(i => i.toString()).join('\n'));
            return sendMessage({client: client, message: message, content: returnString });
        } */
        return sendMessage({ client: client, message: message, content: failString });

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "shop",
    aliases: ["store"],
    description: "Displays items in the shop.",
    options: [{
        name: "equipment",
        type: Discord.ApplicationCommandOptionType.SubCommand,
        description: "Equipment shop."
    }, {
        name: "food",
        type: Discord.ApplicationCommandOptionType.SubCommand,
        description: "Food shop."
    }]
};