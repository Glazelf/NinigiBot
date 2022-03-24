exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        // When converting to slash commands: add support for options below!
        const sendMessage = require('../../util/sendMessage');
        const axios = require("axios");
        let JSONresponse;

        if (!args[0]) return sendMessage({ client: client, message: message, content: "Please specify a Pokémon." });

        // Initialize function
        const getData = async url => {
            try {
                const response = await axios.get(url);
                JSONresponse = response.data;
                lastMonthRank = JSONresponse.rank;
            } catch (error) {
                wasSuccessful = false;
                if (error.response.status = "404") {
                    if (error.response.statusText === "Service Unavailable") {
                        text = "Unable to communicate with the usage stats API. Tell fingerprint it's not working: https://www.smogon.com/forums/members/fingerprint.510904/";
                    } else {
                        text = "No usage data found for " + pokemon + ".";
                    };
                } else {
                    error(new Date().toLocaleString() + error);
                };
            };
        };

        // Indexing makes it 1 lower than the "natural" number associated with a month, but we want last month's data anyways so that works itself out
        const date = new Date();
        let month = date.getMonth();
        if (month == 0) month = "12";
        if (month < 10) month = "0" + month;
        let year = date.getFullYear();

        let format = "gen8vgc2022"
        let rating = "1760";
        let pokemon = args[0].toLowerCase();
        let wasSuccessful = true;

        await getData(`https://smogon-usage-stats.herokuapp.com/${year}/${month}/${format}/${rating}/${pokemon}`);
        if (wasSuccessful) {
            console.log(JSONresponse)

        } else {
            // make generic embed to guide people to usage statistics :)
            const pikalytics = "https://pikalytics.com";
            const psUsage = `https://www.smogon.com/stats/${year}-${month}/${format}-${rating}.txt`;
            const psDetailedUsage = `https://www.smogon.com/stats/${year}-${month}/moveset/${format}-${rating}.txt`;
        };

        // Usage stats API: https://www.smogon.com/forums/threads/usage-stats-api.3661849 (Some of this code is inspired by: https://github.com/DaWoblefet/BoTTT-III)


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
        name: "pokemon",
        type: 3,
        description: "Pokémon to get data on.",
        required: true
    }, {
        name: "format",
        type: 3,
        description: "Format to get data from."
    }, {
        name: "month",
        type: 3,
        description: "Month to get data from."
    }, {
        name: "year",
        type: 3,
        description: "Year to get data from."
    }, {
        name: "rating",
        type: 3,
        description: "Minimum rating to get data from."
    }]
};