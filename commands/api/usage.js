exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        // When converting to slash commands: add support for options below!
        const sendMessage = require('../../util/sendMessage');



    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

// Not yet functional
// Format: i.e. gen8ou, default to most recent VGC.
// Year: i.e. 2022, default to current year (unless its january)
// Month: i.e. 03, default to last month
// Rating: i.e. 1500, default to 1760
// Pokémon: i.e. Pikachu, is required!
module.exports.config = {
    name: "usage",
    aliases: [],
    description: "Shows Pokémon usage data.",
    type: 1,
    options: [{
        name: "format",
        type: 3,
        description: "Format to get data from."
    }, {
        name: "year",
        type: 3,
        description: "Year to get data from."
    }, {
        name: "month",
        type: 3,
        description: "Month to get data from."
    }, {
        name: "rating",
        type: 3,
        description: "Minimum rating to get data from."
    }, {
        name: "pokemon",
        type: 3,
        description: "Pokémon to get data on.",
        required: true
    }]
};