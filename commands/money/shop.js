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

        const input = args.find(element => element.name == "category").value.toLowerCase();
        const condition = { where: { cost: { [ne]: 0 } } };
        let items = null;
        let returnString = null;
        switch (input) {
            // case "items":
            //     items = await CurrencyShop.findAll(condition);
            //     returnString = Discord.Formatters.codeBlock(true, items.map(i => i.toString()).join('\n'));
            //     break;
            case "equipment":
                items = await Equipments.findAll(condition);
                returnString = Discord.Formatters.codeBlock(true, items.map(i => i.toString()).join('\n'));
                break;
            case "food":
                items = await Foods.findAll(condition);
                returnString = Discord.Formatters.codeBlock(true, items.map(i => i.toString()).join('\n'));
                break;
            //// Coming soon, maybe
            // case "key":
            //     items = await KeyItems.findAll(condition);
            //     returnString = Discord.Formatters.codeBlock(true, items.map(i => i.toString()).join('\n'));
            //     break;
            // case "rooms":
            //     items = await Room.findAll(condition);
            //     returnString = Discord.Formatters.codeBlock(true, items.map(i => i.toString()).join('\n'));
            //     break;
            default:
                return sendMessage({ client: client, interaction: interaction, content: `That category doesn't exist.` });
                break;
        };
        return sendMessage({ client: client, interaction: interaction, content: returnString });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "shop",
    description: "Displays items in the shop.",
    options: [{
        name: "category",
        type: "STRING",
        description: "Which shop you'd like to see.",
        required: true
    }]
};