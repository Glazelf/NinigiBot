exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        // When converting to slash commands: add support for options below!
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const axios = require("axios");
        let JSONresponse;

        if (!args[0]) return sendMessage({ client: client, message: message, content: "Please specify a Pokémon." });

        // Initialize function, Usage stats API: https://www.smogon.com/forums/threads/usage-stats-api.3661849 (Some of this code is inspired by: https://github.com/DaWoblefet/BoTTT-III)
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
                    // console.log(error);
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
        let rating = "1500";
        let pokemon = args[0].toLowerCase().replaceAll(" ", "-");
        let wasSuccessful = true;

        await getData(`https://smogon-usage-stats.herokuapp.com/${year}/${month}/${format}/${rating}/${pokemon}`);
        if (wasSuccessful) {
            // console.log(JSONresponse);
            if (Object.keys(JSONresponse.moves).length == 0) return sendMessage({ client: client, message: message, content: `Sorry, but ${JSONresponse.pokemon} only has ${JSONresponse.usage} usage (${JSONresponse.raw} total uses) in ${JSONresponse.tier} so there's not enough data to form an embed!` });

            let moveStats = "";
            for await (const [key, value] of Object.entries(JSONresponse.moves)) {
                moveStats = `${moveStats}\n${key}: ${value}`;
            };
            let itemStats = "";
            for await (const [key, value] of Object.entries(JSONresponse.items)) {
                itemStats = `${itemStats}\n${key}: ${value}`;
            };
            let abilityStats = "";
            for await (const [key, value] of Object.entries(JSONresponse.abilities)) {
                abilityStats = `${abilityStats}\n${key}: ${value}`;
            };
            let spreadStats = "";
            for await (const [key, value] of Object.entries(JSONresponse.spreads)) {
                if (typeof value == "object") {
                    spreadStats = `${spreadStats}\n${key}:`;
                    for await (const [key2, value2] of Object.entries(value)) {
                        spreadStats = `${spreadStats}\n${key2}: ${value2}`;
                    };
                } else {
                    spreadStats = `${spreadStats}\n${key}: ${value}`;
                };
            };
            let teammateStats = "";
            for await (const [key, value] of Object.entries(JSONresponse.teammates)) {
                teammateStats = `${teammateStats}\n${key}: ${value}`;
            };

            let usageEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setFooter({ text: message.member.user.tag })
                .setTimestamp()
                .setAuthor({ name: `${JSONresponse.pokemon} ${JSONresponse.tier} ${rating}+ (${month}/${year})` })
                .setDescription(`#${JSONresponse.rank} | ${JSONresponse.usage} | ${JSONresponse.raw} uses`)
                .addField("Moves:", moveStats, true)
                .addField("Items:", itemStats, true)
                .addField("Abilities:", abilityStats, true)
                .addField("Spreads:", spreadStats, true)
                .addField("Teammates:", teammateStats, true);

            return sendMessage({ client: client, message: message, embeds: usageEmbed });

        } else {
            // make generic embed to guide people to usage statistics :)
            // Buttons
            let usageButtons = new Discord.MessageActionRow()
                .addComponents(new Discord.MessageButton({ label: 'Pikalytics', style: 'LINK', url: "https://pikalytics.com" }))
                .addComponents(new Discord.MessageButton({ label: 'Showdown Usage', style: 'LINK', url: `https://www.smogon.com/stats/${year}-${month}/${format}-${rating}.txt` }))
                .addComponents(new Discord.MessageButton({ label: 'Showdown Usage (Detailed)', style: 'LINK', url: `https://www.smogon.com/stats/${year}-${month}/moveset/${format}-${rating}.txt` }));

            let replyText = "Sorry! I could not successfully fetch *any* data for the inputs you provided. Here are some usage resources you might find usefull instead:";

            return sendMessage({ client: client, message: message, content: replyText, components: usageButtons });
        };

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