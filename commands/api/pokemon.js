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
        const isAdmin = require('../../util/isAdmin');
        const axios = require("axios");
        // Command settings
        let adminBot = isAdmin(client, interaction.guild.me);
        let ephemeral = true;
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg === false) ephemeral = false;
        let emotesAllowed = true;
        if (ephemeral == true && !interaction.guild.me.permissions.has("USE_EXTERNAL_EMOJIS") && !adminBot) emotesAllowed = false;
        await interaction.deferReply({ ephemeral: ephemeral });
        // Bools
        let learnsetBool = false;
        let learnsetArg = interaction.options.getBoolean("learnset");
        if (learnsetArg === true) learnsetBool = true;
        let shinyBool = false;
        let shinyArg = interaction.options.getBoolean("shiny");
        if (shinyArg === true) shinyBool = true;
        // Variables
        let pokemonEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor);
        let pokemonName = interaction.options.getString("pokemon");
        let pokemonButtons = new Discord.MessageActionRow();
        let nameBulbapedia = null;
        let linkBulbapedia = null;
        let JSONresponse;
        let allPokemon = Dex.species.all();
        switch (interaction.options.getSubcommand()) {
            // Abilities
            case "ability":
                let abilitySearch = interaction.options.getString("ability");
                let ability = Dex.abilities.get(abilitySearch);
                if (!ability || !ability.exists || ability.name == "No Ability" || ability.isNonstandard == "CAP") return sendMessage({ client: client, interaction: interaction, content: `Sorry, I could not find an ability by that name.` });

                nameBulbapedia = ability.name.replaceAll(" ", "_");
                // Ability is capitalized on Bulbapedia URLs
                linkBulbapedia = `https://bulbapedia.bulbagarden.net/wiki/${nameBulbapedia}_(Ability)`;

                let abilityMatches = Object.values(allPokemon).filter(pokemon => Object.values(pokemon.abilities).includes(ability.name) && pokemon.exists && pokemon.num > 0);
                let abilityMatchesString = "";
                abilityMatches.forEach(match => abilityMatchesString += `${match.name}, `);
                abilityMatchesString = abilityMatchesString.slice(0, -2);

                pokemonEmbed
                    .setAuthor({ name: ability.name })
                    .setDescription(ability.desc);
                if (abilityMatchesString.length > 0) pokemonEmbed.addField("Pokémon:", abilityMatchesString, false);
                pokemonEmbed.addField("Introduced:", `Gen ${ability.gen}`, true);
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
                if (move.isNonstandard == "Past") description += "\nThis move is not usable in Gen 9.";

                let type = getTypeEmotes({ type1: move.type, emotes: emotesAllowed });
                let category = move.category;
                let ppString = `${move.pp}|${move.pp * 1.2}|${move.pp * 1.4}|${move.pp * 1.6}`;
                if (move.pp == 1 || move.isMax) ppString = null;

                let accuracy = `${move.accuracy}%`;
                if (move.accuracy === true) accuracy = "Can't miss";
                // Smogon target is camelcased for some reason, this splits it on capital letters and formats them better
                let target = capitalizeString(move.target.split(/(?=[A-Z])/).join(" "));
                if (target == "Normal") target = "Any Adjacent";

                let moveTitle = move.name;
                if (move.isMax) moveTitle = `${move.name} (Max Move)`;
                if (move.isZ) moveTitle = `${move.name} (Z-Move)`;

                pokemonEmbed
                    .setAuthor({ name: moveTitle })
                    .setDescription(description);
                if (move.basePower > 0 && !move.isMax) pokemonEmbed.addField("Power:", move.basePower.toString(), true);
                if (target !== "Self") pokemonEmbed.addField("Accuracy:", accuracy, true);
                pokemonEmbed
                    .addField("Type:", type, true)
                    .addField("Category:", category, true)
                    .addField("Target:", target, true);
                if (move.critRatio !== 1) pokemonEmbed.addField("Crit Rate:", move.critRatio.toString(), true);
                if (ppString) pokemonEmbed.addField("PP:", ppString, true);
                if (move.priority !== 0) pokemonEmbed.addField("Priority:", move.priority.toString(), true);
                // if (move.contestType) pokemonEmbed.addField("Contest Type:", move.contestType, true);
                // if (move.zMove && move.zMove.basePower && move.gen < 8) pokemonEmbed.addField("Z-Power:", move.zMove.basePower.toString(), true);
                // if (move.maxMove && move.maxMove.basePower && move.gen < 9 && move.maxMove.basePower > 1 && !move.isMax) pokemonEmbed.addField("Max Move Power:", move.maxMove.basePower.toString(), true);
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
                let format = Dex.formats.get(formatSearch);
                if (!format || !format.exists) return sendMessage({ client: client, interaction: interaction, content: `Sorry, I could not find a format by that name.` });

                if (format.threads) {
                    format.threads.forEach(thread => {
                        pokemonButtons
                            .addComponents(new Discord.MessageButton({ label: thread.split(">")[1].split("<")[0], style: 'LINK', url: thread.split("\"")[1] }));
                    });
                };
                // Leading newlines get ignored if format.desc is empty
                let formatDescription = (format.desc + "\n").replace("Pok&eacute;mon", "Pokémon");
                if (format.searchShow) {
                    formatDescription += `\nThis format has an ongoing [ladder](https://pokemonshowdown.com/ladder/${format.id}).`;
                } else if (format.rated) {
                    formatDescription += `\nThis format has a [ladder](https://pokemonshowdown.com/ladder/${format.id}) but can not currently be played on said ladder.`;
                } else {
                    formatDescription += "\nThis format does not have a ladder.";
                };
                if (format.challengeShow) {
                    formatDescription += "\nYou can challenge users in this format.";
                } else {
                    formatDescription += "\nYou can not challenge users in this format.";
                };
                if (format.tournamentShow) {
                    formatDescription += "\nThis format can be used for tournaments.";
                } else {
                    formatDescription += "\nThis format can not be used for tournaments.";
                };
                let ruleset = null;
                if (format.ruleset && format.ruleset.length > 0) ruleset = format.ruleset.join(", ");
                let banlist = null;
                if (format.banlist && format.banlist.length > 0) banlist = format.banlist.join(", ");
                let unbanlist = null;
                if (format.unbanlist && format.unbanlist.length > 0) unbanlist = format.unbanlist.join(", ");

                pokemonEmbed
                    .setAuthor({ name: `${format.name} (${format.section})` })
                    .setDescription(formatDescription)
                if (ruleset) pokemonEmbed.addField("Ruleset:", ruleset, false);
                if (banlist) pokemonEmbed.addField("Banlist:", banlist, false);
                if (unbanlist) pokemonEmbed.addField("Unbanlist:", unbanlist, false);
                if (format.restricted && format.restricted.length > 0) pokemonEmbed.addField("Restricted type:", format.restricted.join(", "), false);
                break;
            // Pokémon
            case "pokemon":
                let pokemon = Dex.species.get(pokemonName);
                if (pokemonName.toLowerCase() == "random") {
                    let allKeys = Object.keys(allPokemon);
                    pokemon = allPokemon[allKeys[allKeys.length * Math.random() << 0]];
                } else if (!pokemon || !pokemon.exists || pokemon.num <= 0) return sendMessage({ client: client, interaction: interaction, content: `Sorry, I could not find a Pokémon by that name.` });
                let messageObject = await getPokemon({ client: client, interaction: interaction, pokemon: pokemon, learnsetBool: learnsetBool, shinyBool: shinyBool, ephemeral: ephemeral });
                return sendMessage({ client: client, interaction: interaction, embeds: messageObject.embeds, components: messageObject.components, ephemeral: ephemeral });
                break;
            case "usage":
                let formatInput = "gen9vgc2023series1";
                let formatArg = interaction.options.getString("format");
                if (formatArg) formatInput = formatArg;
                // There's a LOT of inconsistencies between the format names in Showdown and https://www.smogon.com/stats/
                if (formatInput == "gen7vgc2019") formatInput = "gen7vgc2019ultraseries";

                let rating = 0;
                let ratingTresholds = [0, 1500, 1630, 1760];
                if (formatInput.match(/gen.{1,2}(ou)$/g)) ratingTresholds = [0, 1500, 1695, 1825]; // OU has different rating tresholds
                let ratingArg = interaction.options.getInteger("rating");
                if (ratingTresholds.includes(ratingArg)) rating = ratingArg;

                let monthArg = interaction.options.getInteger("month");
                let yearArg = interaction.options.getInteger("year");
                // Indexing makes it 1 lower than the "natural" number associated with a month, but we want last month's data anyways so that works itself out
                const date = new Date();
                let month = date.getMonth();
                let year = date.getFullYear();
                if (month == 0) {
                    month = 12;
                    year = year - 1;
                };
                let stringCurrentMonth = month;
                if (stringCurrentMonth < 10) stringCurrentMonth = "0" + stringCurrentMonth;
                if (monthArg <= 12 && monthArg > 0) month = monthArg;
                let stringMonth = month;
                if (stringMonth < 10) stringMonth = "0" + stringMonth;
                if (yearArg >= 2014 && yearArg <= year) year = yearArg; // Smogon stats only exist from 2014 onwards
                // Format URL and other variables
                let searchURL = `https://www.smogon.com/stats/${year}-${stringMonth}/moveset/${formatInput}-${rating}.txt`;
                let response = null;
                let failText = `Could not fetch data for the inputs you provided.\nThe most common reasons for this are spelling mistakes and a lack of Smogon data. If it's early in the month it's possible usage for last month has not been uploaded yet.`;
                let usageButtons = new Discord.MessageActionRow()
                    .addComponents(new Discord.MessageButton({ label: 'Pikalytics', style: 'LINK', url: "https://pikalytics.com" }))
                    .addComponents(new Discord.MessageButton({ label: 'Showdown Usage', style: 'LINK', url: `https://www.smogon.com/stats/` }))
                    .addComponents(new Discord.MessageButton({ label: 'Showdown Usage (Detailed)', style: 'LINK', url: searchURL }));
                try {
                    response = await axios.get(searchURL);
                    genericUsageResponse = await axios.get(`https://www.smogon.com/stats/${year}-${stringMonth}/${formatInput}-${rating}.txt`);
                } catch (e) {
                    // console.log(e);
                    // Make generic embed to guide people to usage statistics :)
                    let replyText = failText;
                    return sendMessage({ client: client, interaction: interaction, content: replyText, components: usageButtons });
                };
                // Filter, split and trim pokemon data
                let usageArray = response.data.replaceAll("|", "").replaceAll("\n", "").trim().split(`----------------------------------------+  +----------------------------------------+`);
                await Object.keys(usageArray).forEach(key => { usageArray[key] = usageArray[key].replaceAll("+", "").replaceAll("--", "") });
                usageArray = usageArray.map(element => element.trim());

                // Variables for generic usage data
                let totalBattleCount = genericUsageResponse.data.split("battles: ")[1].split("Avg.")[0].replace("\n", "").trim();
                let rawUsage = 0;
                let usagePercentage = 0;
                let usageRank = 0;
                let genericDataSplitPokemon = null;
                let pokemonDataSplitLine = null;
                let usageEmbed = new Discord.MessageEmbed()
                    .setColor(globalVars.embedColor);
                if (pokemonName) {
                    let usagePokemonString = usageArray.find(element => element.startsWith(pokemonName));
                    if (!usagePokemonString) return sendMessage({ client: client, interaction: interaction, content: `Could not find any data for ${pokemonName} in ${formatInput} during the specified month.`, components: usageButtons });
                    // Data from generic usage page
                    genericDataSplitPokemon = genericUsageResponse.data.split(pokemonName);
                    pokemonDataSplitLine = genericDataSplitPokemon[1].split("|");
                    rawUsage = pokemonDataSplitLine[2].trim();
                    usagePercentage = `${Math.round(pokemonDataSplitLine[1].trim().replace("%", "") * 100) / 100}%`;
                    usageRank = genericDataSplitPokemon[0].split("|");
                    usageRank = usageRank[usageRank.length - 2].trim();
                    // Specific data, .map() is to trim each entry in the array to avoid weird spacing on mobile clients
                    let abilitiesString = usagePokemonString.split("Abilities")[1].split("Items")[0].split("%").map(function (x) { return x.trim(); }).join("%\n").replaceAll("   ", "");
                    let itemsString = usagePokemonString.split("Items")[1].split("Spreads")[0].split("%").map(function (x) { return x.trim(); }).join("%\n").replaceAll("   ", "");
                    let spreadsString = usagePokemonString.split("Spreads")[1].split("Moves")[0].split("%").map(function (x) { return x.trim(); }).join("%\n").replaceAll("   ", "").replaceAll(":", " ");
                    let movesString = usagePokemonString.split("Moves")[1].split("Teammates")[0].split("%").map(function (x) { return x.trim(); }).join("%\n").replaceAll("   ", "");
                    let teammatesString = usagePokemonString.split("Teammates")[1].split("Checks and Counters")[0].split("%").map(function (x) { return x.trim(); }).join("%\n").replaceAll("   ", "");
                    let countersString = usagePokemonString.split("Checks and Counters")[1].split("out)").map(function (x) { return x.trim(); }).join("out)\n").replaceAll("   ", "");
                    usageEmbed
                        .setAuthor({ name: `${pokemonName} ${formatInput} ${rating}+ (${stringMonth}/${year})` })
                        .setDescription(`#${usageRank} | ${usagePercentage} | ${rawUsage} uses`)
                        .addField("Moves:", movesString, true)
                        .addField("Items:", itemsString, true)
                        .addField("Abilities:", abilitiesString, true)
                        .addField("Spreads:", spreadsString, true)
                        .addField("Teammates:", teammatesString, true);
                    if (countersString.length > 0) usageEmbed.addField("Checks and Counters:", countersString, true);
                } else {
                    // Format generic data display
                    let usageList = [];
                    let usageListIndex = 1;
                    await usageArray.forEach(element => {
                        pokemonName = element.split("Raw count")[0].trim();
                        // Percentage determination copied from generic usage data parsing for specific pokemon
                        genericDataSplitPokemon = genericUsageResponse.data.split(pokemonName);
                        pokemonDataSplitLine = genericDataSplitPokemon[1].split("|");
                        usagePercentage = `${Math.round(pokemonDataSplitLine[1].trim().replace("%", "") * 100) / 100}%`;
                        usageList.push(`${usageListIndex}.${pokemonName} ${usagePercentage}`);
                        usageListIndex++;
                    });
                    let usageListPart1 = [];
                    let usageListPart2 = [];
                    await usageList.forEach(element => { if (usageListPart1.length < 50) usageListPart1.push(element); else if (usageListPart2.length < 50) usageListPart2.push(element) });
                    usageEmbed
                        .setAuthor({ name: `Usage for ${formatInput} ${rating}+ (${stringMonth}/${year})` })
                        .addField("1-50", usageListPart1.join("\n"), true)
                        .addField("51-100", usageListPart2.join("\n"), true)
                };
                return sendMessage({ client: client, interaction: interaction, embeds: usageEmbed, ephemeral: ephemeral });
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
            description: "Whether the reply will be private."
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
            description: "Whether the reply will be private."
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
            description: "Whether the reply will be private."
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
            description: "Whether the reply will be private."
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
            description: "Whether the reply will be private."
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
            name: "learnset",
            type: "BOOLEAN",
            description: "Whether to show the Pokémon's learnset."
        }, {
            name: "shiny",
            type: "BOOLEAN",
            description: "Whether to show the Pokémon's shiny sprite."
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }, {
        name: "usage",
        type: "SUB_COMMAND",
        description: "Shows Smogon usage data.",
        options: [{
            name: "format",
            type: "STRING",
            description: "Format to get data from.",
            autocomplete: true,
            required: true
        }, {
            name: "pokemon",
            type: "STRING",
            description: "Pokémon to get data on.",
            autocomplete: true
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
            description: "Whether the reply will be private."
        }]
    }]
};