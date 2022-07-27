exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const { Dex } = require('pokemon-showdown');
        const getPokemon = require('../../util/pokemon/getPokemon');
        const getTypeEmotes = require('../../util/pokemon/getTypeEmotes');
        const capitalizeString = require('../../util/capitalizeString');
        const axios = require("axios");

        let ephemeral = true;
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg === false) ephemeral = false;
        let emotesAllowed = true;
        if (ephemeral == true && !interaction.guild.roles.everyone.permissions.has("USE_EXTERNAL_EMOJIS")) emotesAllowed = false;
        await interaction.deferReply({ ephemeral: ephemeral });

        let pokemonEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor);

        let pokemonName = interaction.options.getString("pokemon");
        let pokemonButtons = new Discord.MessageActionRow();
        let nameBulbapedia = null;
        let linkBulbapedia = null;
        let JSONresponse;

        switch (interaction.options.getSubcommand()) {
            // Abilities
            case "ability":
                let abilitySearch = interaction.options.getString("ability");
                let ability = Dex.abilities.get(abilitySearch);
                if (!ability || !ability.exists || ability.name == "No Ability" || ability.isNonstandard == "CAP") return sendMessage({ client: client, interaction: interaction, content: `Sorry, I could not find an ability by that name.` });

                nameBulbapedia = ability.name.replaceAll(" ", "_");
                // Ability is capitalized on Bulbapedia URLs
                linkBulbapedia = `https://bulbapedia.bulbagarden.net/wiki/${nameBulbapedia}_(Ability)`;

                pokemonEmbed
                    .setAuthor({ name: ability.name })
                    .setDescription(ability.desc)
                    .addField("Introduced:", `Gen ${ability.gen}`, false);
                break;

            // Items
            case "item":
                let itemSearch = interaction.options.getString("item");
                let item = Dex.items.get(itemSearch);
                if (!item || !item.exists) return sendMessage({ client: client, interaction: interaction, content: `Sorry, I could not find an item by that name.` });

                let itemImage = `https://www.serebii.net/itemdex/sprites/pgl/${item.id}.png`;

                nameBulbapedia = item.name.replaceAll(" ", "_");
                linkBulbapedia = `https://bulbapedia.bulbagarden.net/wiki/${nameBulbapedia}`;

                pokemonEmbed
                    .setAuthor({ name: item.name })
                    .setThumbnail(itemImage)
                    .setDescription(item.desc);
                if (item.fling) pokemonEmbed.addField("Fling Power:", item.fling.basePower.toString(), true);
                pokemonEmbed.addField("Introduced:", `Gen ${item.gen}`, true);
                break;

            // Moves
            case "move":
                let moveSearch = interaction.options.getString("move");
                let move = Dex.moves.get(moveSearch);

                if (!move || !move.exists || move.isNonstandard == "CAP") return sendMessage({ client: client, interaction: interaction, content: `Sorry, I could not find a move by that name.` });

                nameBulbapedia = move.name.replaceAll(" ", "_");
                // Move is NOT capitalized on Bulbapedia URLs
                linkBulbapedia = `https://bulbapedia.bulbagarden.net/wiki/${nameBulbapedia}_(move)`;

                let description = move.desc;
                if (move.flags.contact) description += " Makes contact with the target.";
                if (move.flags.bypasssub) description += " Bypasses Substitute.";

                let type = await getTypeEmotes({ type1: move.type, emotes: emotesAllowed });
                let category = move.category;
                let ppString = `${move.pp}|${move.pp * 1.2}|${move.pp * 1.4}|${move.pp * 1.6}`;
                if (move.pp == 1 || move.isMax) ppString = null;

                let accuracy = `${move.accuracy}%`;
                if (move.accuracy === true) accuracy = "Can't miss";

                // Smogon target is camelcased for some reason, this splits it on capital letters and formats them better
                let target = await capitalizeString(move.target.split(/(?=[A-Z])/).join(" "));
                if (target == "Normal") target = "Any Adjacent";

                let moveTitle = move.name;
                if (move.isMax) moveTitle = `${move.name} (Max Move)`;
                if (move.isZ) moveTitle = `${move.name} (Z-Move)`;

                pokemonEmbed
                    .setAuthor({ name: moveTitle })
                    .setDescription(description);
                if (move.basePower > 0 && !move.isMax) pokemonEmbed.addField("Power:", move.basePower.toString(), true);
                pokemonEmbed
                    .addField("Accuracy:", accuracy, true)
                    .addField("Type:", type, true)
                    .addField("Category:", category, true)
                    .addField("Target:", target, true);
                if (move.critRatio !== 1) pokemonEmbed.addField("Crit Rate:", move.critRatio.toString(), true);
                if (ppString) pokemonEmbed.addField("PP:", ppString, true);
                if (move.priority !== 0) pokemonEmbed.addField("Priority:", move.priority.toString(), true);
                // if (move.contestType) pokemonEmbed.addField("Contest Type:", move.contestType, true);
                // if (move.zMove && move.zMove.basePower && move.gen < 8) pokemonEmbed.addField("Z-Power:", move.zMove.basePower.toString(), true);
                if (move.maxMove && move.maxMove.basePower && move.maxMove.basePower > 1 && !move.isMax) pokemonEmbed.addField("Max Move Power:", move.maxMove.basePower.toString(), true);
                pokemonEmbed.addField("Introduced:", `Gen ${move.gen}`, true);
                break;

            // Natures
            case "nature":
                let natureSearch = interaction.options.getString("nature");
                let nature = Dex.natures.get(natureSearch);
                if (!nature || !nature.exists) return sendMessage({ client: client, interaction: interaction, content: `Sorry, I could not find a nature by that name.` });

                let boosted = Dex.stats.names[nature.plus];
                let lowered = Dex.stats.names[nature.minus];
                let arrowUp = "<:arrow_up_red:909901820732784640>";
                let arrowDown = "<:arrow_down_blue:909903420054437929>";
                let resultString = "Neutral nature, no stat changes.";
                if (boosted && lowered) {
                    if (emotesAllowed) {
                        boosted = `${arrowUp}${boosted}`;
                        lowered = `${arrowDown}${lowered}`;
                    } else {
                        boosted = `Boosted: ${boosted}`;
                        lowered = `Lowered: ${lowered}`;
                    };
                    resultString = `${boosted}\n${lowered}`;
                };
                pokemonEmbed
                    .setAuthor({ name: nature.name })
                    .setDescription(resultString);
                break;

            // Format
            case "format":
                let formatSearch = interaction.options.getString("format");
                let formatDex = Dex.formats.get(formatSearch);
                if (!formatDex || !formatDex.exists) return sendMessage({ client: client, interaction: interaction, content: `Sorry, I could not find a format by that name.` });

                pokemonEmbed
                    .setAuthor({ name: formatDex.name })

                break;
            // Pokémon
            case "pokemon":
                let pokemon = Dex.species.get(pokemonName);
                if (!pokemon || !pokemon.exists || pokemon.isNonstandard == "Custom" || pokemon.isNonstandard == "CAP") return sendMessage({ client: client, interaction: interaction, content: `Sorry, I could not find a Pokémon by that name.` });
                let messageObject = await getPokemon(client, interaction, pokemon, ephemeral);
                return sendMessage({ client: client, interaction: interaction, embeds: messageObject.embeds, components: messageObject.components, ephemeral: ephemeral });
                break;

            case "usage":
                // Initialize function, Usage stats API: https://www.smogon.com/forums/threads/usage-stats-api.3661849 (Some of this code is inspired by: https://github.com/DaWoblefet/BoTTT-III)
                const getData = async url => {
                    try {
                        const response = await axios.get(url);
                        JSONresponse = response.data;
                        lastMonthRank = JSONresponse.rank;
                        wasSuccessful = true;
                    } catch (error) {
                        wasSuccessful = false;
                        if (error.response.status = "404") {
                            if (error.response.statusText === "Service Unavailable") {
                                text = "Unable to communicate with the usage stats API. Tell fingerprint it's not working: https://www.smogon.com/forums/members/fingerprint.510904/";
                            } else {
                                text = "No usage data found for " + pokemonName + ".";
                            };
                        } else {
                            // console.log(error);
                        };
                    };
                };
                let format = "gen8vgc2022";
                let formatArg = interaction.options.getString("format");
                if (formatArg) format = formatArg;
                // There's a LOT of inconsistencies between the format names in pokemon-showdown and https://www.smogon.com/stats/
                if (format == "gen7vgc2019") format = "gen7vgc2019ultraseries";

                let monthArg = interaction.options.getInteger("month");
                let yearArg = interaction.options.getInteger("year");
                // Indexing makes it 1 lower than the "natural" number associated with a month, but we want last month's data anyways so that works itself out
                const date = new Date();
                let month = date.getMonth();
                if (month == 0) month = 12;
                let stringCurrentMonth = month;
                if (stringCurrentMonth < 10) stringCurrentMonth = "0" + stringCurrentMonth;
                if (monthArg < 13 && monthArg > 0) month = monthArg;

                let stringMonth = month;
                if (stringMonth < 10) stringMonth = "0" + stringMonth;
                let year = date.getFullYear();
                if (yearArg > 2013 && yearArg < (year + 1)) year = yearArg; // Smogon stats only exist from 2014 onwards

                let rating = "1500";
                let ratingTresholds = [0, 1500, 1630, 1760];
                if (format == "gen8ou") ratingTresholds = [0, 1500, 1695, 1825]; // OU has different rating tresholds
                let ratingArg = interaction.options.getInteger("rating");
                if (ratingTresholds.includes(ratingArg)) rating = ratingArg;

                let wasSuccessful = true;
                let triedLastMonth = false;
                let searchURL = `https://smogon-usage-stats.herokuapp.com/${year}/${stringMonth}/${format}/${rating}/${pokemonName}`;

                await getData(searchURL);
                return useData();

                async function useData() {
                    if (wasSuccessful) {
                        // console.log(JSONresponse);
                        if (Object.keys(JSONresponse.moves).length == 0) return sendMessage({ client: client, interaction: interaction, content: `${JSONresponse.pokemon} only has ${JSONresponse.usage} usage (${JSONresponse.raw} total uses) in ${JSONresponse.tier} (${stringMonth}/${year}) so there's not enough data to form an embed!` });

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
                            .setAuthor({ name: `${JSONresponse.pokemon} ${JSONresponse.tier} ${rating}+ (${stringMonth}/${year})` })
                            .setDescription(`#${JSONresponse.rank} | ${JSONresponse.usage} | ${JSONresponse.raw} uses`)
                            .addField("Moves:", moveStats, true)
                            .addField("Items:", itemStats, true)
                            .addField("Abilities:", abilityStats, true)
                            .addField("Spreads:", spreadStats, true)
                            .addField("Teammates:", teammateStats, true);

                        return sendMessage({ client: client, interaction: interaction, embeds: usageEmbed, ephemeral: ephemeral });

                    } else if (triedLastMonth == false && year == date.getYear() && month == stringCurrentMonth) {
                        // Try month-1 in case it's early in the month and last month's stats haven't been posted yet :)
                        // Downside to this approach is that it will try fetching on typos twice
                        month = month - 1;
                        if (month == 0) month = 12;
                        stringMonth = month;
                        if (stringMonth < 10) stringMonth = "0" + stringMonth;
                        triedLastMonth = true;
                        searchURL = `https://smogon-usage-stats.herokuapp.com/${year}/${stringMonth}/${format}/${rating}/${pokemonName}`;

                        await getData(searchURL);
                        return useData();

                    } else {
                        // make generic embed to guide people to usage statistics :)
                        let usageButtons = new Discord.MessageActionRow()
                            .addComponents(new Discord.MessageButton({ label: 'Pikalytics', style: 'LINK', url: "https://pikalytics.com" }))
                            .addComponents(new Discord.MessageButton({ label: 'Showdown Usage', style: 'LINK', url: `https://www.smogon.com/stats/` }))
                            .addComponents(new Discord.MessageButton({ label: 'Showdown Usage (Detailed)', style: 'LINK', url: `https://www.smogon.com/stats/${year}-${stringMonth}/moveset/${format}-${rating}.txt` }));

                        let replyText = `Sorry! Could not fetch data for the inputs you provided. The most common reasons for this are spelling mistakes and a lack of Smogon data.\nHere are some usage resources you might find usefull instead:`;

                        return sendMessage({ client: client, interaction: interaction, content: replyText, components: usageButtons });
                    };
                };
                break;
        };

        // Bulbapedia button
        if (linkBulbapedia) {
            pokemonButtons
                .addComponents(new Discord.MessageButton({ label: 'More info', style: 'LINK', url: linkBulbapedia }));
        };

        // Send function for all except default
        if (pokemonEmbed.author) sendMessage({ client: client, interaction: interaction, embeds: pokemonEmbed, components: pokemonButtons, ephemeral: ephemeral });
        return;

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "pokemon",
    description: "Shows Pokémon data.",
    type: "SUB_COMMAND",
    options: [{
        name: "ability",
        type: "SUB_COMMAND",
        description: "Get info on an ability.",
        options: [{
            name: "ability",
            type: "STRING",
            description: "Ability to get info on.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether this command is only visible to you."
        }]
    }, {
        name: "item",
        type: "SUB_COMMAND",
        description: "Get info on an item.",
        options: [{
            name: "item",
            type: "STRING",
            description: "Item to get info on.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether this command is only visible to you."
        }]
    }, {
        name: "move",
        type: "SUB_COMMAND",
        description: "Get info on a move.",
        options: [{
            name: "move",
            type: "STRING",
            description: "Move to get info on.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether this command is only visible to you."
        }]
    }, {
        name: "nature",
        type: "SUB_COMMAND",
        description: "Get info on a nature.",
        options: [{
            name: "nature",
            type: "STRING",
            description: "Nature to get info on.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether this command is only visible to you."
        }]
    }, {
        name: "format",
        type: "SUB_COMMAND",
        description: "Get info on a format.",
        options: [{
            name: "format",
            type: "STRING",
            description: "Format to get info on.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether this command is only visible to you."
        }]
    }, {
        name: "pokemon",
        type: "SUB_COMMAND",
        description: "Get info on a Pokémon.",
        options: [{
            name: "pokemon",
            type: "STRING",
            description: "Pokémon to get info on.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether this command is only visible to you."
        }]
    }, {
        name: "usage",
        type: "SUB_COMMAND",
        description: "Shows Smogon usage data.",
        options: [{
            name: "pokemon",
            type: "STRING",
            description: "Pokémon to get data on.",
            autocomplete: true,
            required: true
        }, {
            name: "format",
            type: "STRING",
            description: "Format to get data from.",
            autocomplete: true,
            required: true
        }, {
            name: "month",
            type: "INTEGER",
            description: "Month (number) to get data from."
        }, {
            name: "year",
            type: "INTEGER",
            description: "Year to get data from."
        }, {
            name: "rating",
            type: "INTEGER",
            description: "Minimum rating to get data from.",
            autocomplete: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether this command is only visible to you."
        }]
    }]
};