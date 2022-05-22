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
        switch (input) {
            // case "items":
            //     const items = await CurrencyShop.findAll(condition);
            //     let returnString = Discord.Formatters.codeBlock(true, items.map(i => i.toString()).join('\n'));
            //     return sendMessage({ client: client, interaction: interaction, content: returnString });
            //     break;
            case "equipment":
                const items = await Equipments.findAll(condition);
                let returnString = Discord.Formatters.codeBlock(true, items.map(i => i.toString()).join('\n'));
                return sendMessage({ client: client, interaction: interaction, content: returnString });
                break;
            case "food":
                const items = await Foods.findAll(condition);
                let returnString = Discord.Formatters.codeBlock(true, items.map(i => i.toString()).join('\n'));
                return sendMessage({ client: client, interaction: interaction, content: returnString });
                break;
            //// Coming soon, maybe
            // case "key":
            //     const items = await KeyItems.findAll(condition);
            //     let returnString = Discord.Formatters.codeBlock(true, items.map(i => i.toString()).join('\n'));
            //     return sendMessage({ client: client, interaction: interaction, content: returnString });
            //     break;
            // case "rooms":
            //     const items = await Room.findAll(condition);
            //     let returnString = Discord.Formatters.codeBlock(true, items.map(i => i.toString()).join('\n'));
            //     return sendMessage({ client: client, interaction: interaction, content: returnString });
            //     break;
            default:
                return sendMessage({ client: client, interaction: interaction, content: `That category doesn't exist.` });
                break;
        };

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