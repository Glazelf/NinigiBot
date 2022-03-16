exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const Pokedex = await import('pokedex-promise-v2');
        const P = new Pokedex.default();
        const correctionName = require('../../objects/pokemon/correctionName.json');
        const easterEggName = require('../../objects/pokemon/easterEggName.json');
        const getPokemon = require('../../util/pokemon/getPokemon');
        const getTypeEmotes = require('../../util/pokemon/getTypeEmotes');
        const capitalizeString = require('../../util/capitalizeString');
        const randomNumber = require('../../util/randomNumber');

        if (!args[0]) return sendMessage({ client: client, message: message, content: `You need to provide either a subcommand or a Pokémon to look up.` });

        let subCommand = args[0].toLowerCase();
        let subArgument;
        if (args[1]) subArgument = args.slice(1).join("-").replace(" ", "-").toLowerCase();

        let arrowUp = "<:arrow_up_red:909901820732784640>";
        let arrowDown = "<:arrow_down_blue:909903420054437929>";

        let pokemonEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setFooter({ text: message.member.user.tag })
            .setTimestamp();

        let pokemonButtons = new Discord.MessageActionRow();

        switch (subCommand) {
            // Abilities
            case "ability":
                await P.getAbilityByName(subArgument)
                    .then(async function (response) {
                        // Why are german entries still tagged as English?
                        // let englishEntry = response.effect_entries.find(element => element.language.name = "en");
                        // English entries always seem to be either the only or the last entry, so this should work. For now.
                        let abilityDescription;
                        let englishEntry = response.effect_entries.find(element => element.language.name == "en");

                        if (englishEntry) {
                            abilityDescription = englishEntry.short_effect;
                        } else {
                            englishEntry = response.flavor_text_entries.find(element => element.language.name == "en");
                            abilityDescription = englishEntry.flavor_text;
                        };

                        let abilityName = await capitalizeString(response.name);
                        let nameBulbapedia = abilityName.replaceAll(" ", "_");

                        // Buttons
                        pokemonButtons
                            .addComponents(new Discord.MessageButton({ label: 'More info', style: 'LINK', url: `https://bulbapedia.bulbagarden.net/wiki/${nameBulbapedia}_(Ability)` }));

                        pokemonEmbed
                            .setAuthor({ name: abilityName })
                            .addField("Description:", abilityDescription, false);

                    }).catch(function (e) {
                        console.log(e);
                        if (e.toString().includes("Missing Permissions")) {
                            return logger(e, client, message);
                        } else {
                            return sendMessage({ client: client, message: message, content: `Could not find the specified ability.` });
                        };
                    });
                break;

            // Items
            case "item":
                await P.getItemByName(subArgument)
                    .then(async function (response) {
                        let itemName = response.name.replace("-", "").toLowerCase();
                        let itemImage = `https://www.serebii.net/itemdex/sprites/pgl/${itemName}.png`;
                        let itemAuthorName = await capitalizeString(response.name);
                        let nameBulbapedia = itemAuthorName.replaceAll(" ", "_");
                        let category = await capitalizeString(response.category.name);

                        let effectEntry = response.effect_entries.find(element => element.language.name == "en");
                        let description = effectEntry.short_effect;

                        pokemonButtons
                            .addComponents(new Discord.MessageButton({ label: 'More info', style: 'LINK', url: `https://bulbapedia.bulbagarden.net/wiki/${nameBulbapedia}` }));

                        pokemonEmbed
                            .setAuthor({ name: itemName })
                            .setThumbnail(response.sprites.default)
                            .addField("Category:", category, true)
                            .addField("Description:", description, false)
                            .setImage(itemImage);

                    }).catch(function (e) {
                        // console.log(e);
                        if (e.toString().includes("Missing Permissions")) {
                            return logger(e, client, message);
                        } else {
                            return sendMessage({ client: client, message: message, content: `Could not find the specified item.` });
                        };
                    });
                break;

            // Moves
            case "move":
                await P.getMoveByName(subArgument)
                    .then(async function (response) {
                        let description;
                        try {
                            let effectEntry = response.effect_entries.find(element => element.language.name == "en");
                            description = effectEntry.short_effect.replace("$effect_chance", response.effect_chance);
                        } catch (e) {
                            description = null;
                        };
                        let moveName = await capitalizeString(response.name);
                        let nameBulbapedia = moveName.replaceAll(" ", "_");
                        let type = await getTypeEmotes(response.type.name);
                        let category = await capitalizeString(response.damage_class.name);
                        let target = await capitalizeString(response.target.name);
                        let ppString;
                        if (response.pp) ppString = `${response.pp}|${response.pp * 1.2}|${response.pp * 1.4}|${response.pp * 1.6}`;

                        pokemonButtons
                            .addComponents(new Discord.MessageButton({ label: 'More info', style: 'LINK', url: `https://bulbapedia.bulbagarden.net/wiki/${nameBulbapedia}_(move)` }));

                        pokemonEmbed
                            .setAuthor({ name: moveName })
                            .addField("Type:", type, true)
                            .addField("Category:", category, true);
                        if (response.power) pokemonEmbed.addField("Power:", response.power.toString(), true);
                        if (response.accuracy) pokemonEmbed.addField("Accuracy:", `${response.accuracy}%`, true);
                        if (response.pp) pokemonEmbed.addField("PP:", ppString, true)
                        if (response.priority !== 0) pokemonEmbed.addField("Priority:", response.priority.toString(), true);
                        pokemonEmbed
                            .addField("Target:", target, true);
                        if (description) pokemonEmbed.addField("Description:", description, false);

                    }).catch(function (e) {
                        // console.log(e);
                        if (e.toString().includes("Missing Permissions")) {
                            return logger(e, client, message);
                        } else {
                            return sendMessage({ client: client, message: message, content: `Could not find the specified move.` });
                        };
                    });
                break;

            case "nature":
                await P.getNatureByName(subArgument)
                    .then(async function (response) {
                        let author = await capitalizeString(response.name);
                        let statUp;
                        let statDown;
                        let statString;
                        let flavourUp;
                        let flavourDown;
                        let flavourString;

                        if (response.increased_stat && response.increased_stat.name) {
                            statUp = await capitalizeString(response.increased_stat.name);
                            statDown = await capitalizeString(response.decreased_stat.name);
                            statString = `${arrowUp} ${statUp}\n${arrowDown} ${statDown}`;

                            flavourUp = await capitalizeString(response.likes_flavor.name);
                            flavourDown = await capitalizeString(response.hates_flavor.name);
                            flavourString = `${arrowUp} ${flavourUp}\n${arrowDown} ${flavourDown}`;
                        } else {
                            statString = "Neutral";
                            flavourString = statString;
                        };

                        pokemonEmbed
                            .setAuthor({ name: author })
                            .addField("Stats:", statString)
                            .addField("Flavours:", flavourString)

                    }).catch(function (e) {
                        // console.log(e);
                        if (e.toString().includes("Missing Permissions")) {
                            return logger(e, client, message);
                        } else {
                            return sendMessage({ client: client, message: message, content: `Could not find the specified nature.` });
                        };
                    });
                break;

            // Default: Pokémon
            default:
                // Public variables
                var pokemonName = args;
                var pokemonID;

                let minPkmID = 1; // Bulbasaur
                let maxPkmID = 898; // Calyrex

                // Catch Slash Command structure
                if (message.type == 'APPLICATION_COMMAND') pokemonName = pokemonName.slice(1);

                // Edgecase name corrections
                pokemonName = pokemonName.join("-").replace(" ", "-").replace(":", "").toLowerCase();
                await correctValue(correctionName, pokemonName);

                // Easter egg name aliases
                await correctValue(easterEggName, pokemonName);

                // Random Pokémon if argument is "random"
                let randomID = await randomNumber(minPkmID, maxPkmID);
                if (pokemonName.toLowerCase() == "random") pokemonName = randomID;

                P.getPokemonByName(pokemonName)
                    .then(async function (response) {
                        let messageObject = await getPokemon(client, message, response);
                        return sendMessage({ client: client, message: message, embeds: messageObject.embed, components: messageObject.buttons });

                    }).catch(function (e) {
                        // console.log(e);
                        if (e.toString().includes("Missing Permissions")) {
                            return logger(e, client, message);
                        } else {
                            return sendMessage({ client: client, message: message, content: `Could not find the specified Pokémon.` });
                        };
                    });
                break;
        };

        // Send function for all except default
        if (pokemonEmbed.author) sendMessage({ client: client, message: message, embeds: pokemonEmbed, components: pokemonButtons });
        return;

        // Correct common name discrepancies
        async function correctValue(object, input) {
            var uncorrectedNames = Object.keys(object);
            uncorrectedNames.forEach(function (key) {
                if (pokemonName == key) {
                    if (input == pokemonName) pokemonName = object[key];
                    if (input == pokemonID) pokemonID = object[key];
                };
            });
        };

        function getKeyByValue(object, value) {
            return Object.keys(object).find(key => object[key] === value);
        };

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "pokemon",
    aliases: ["pkm", "pkmn"],
    description: "Shows Pokémon data.",
    type: 1,
    options: [{
        name: "ability",
        type: 1,
        description: "Get info on an ability.",
        options: [{
            name: "ability-name",
            type: 3,
            description: "Get ability info by its English name.",
            required: true
        }]
    }, {
        name: "item",
        type: 1,
        description: "Get info on an item.",
        options: [{
            name: "item-name",
            type: 3,
            description: "Get item info by its English name.",
            required: true
        }]
    }, {
        name: "move",
        type: 1,
        description: "Get info on a move.",
        options: [{
            name: "move-name",
            type: 3,
            description: "Get move info by its English name.",
            required: true
        }]
    }, {
        name: "nature",
        type: 1,
        description: "Get info on a nature.",
        options: [{
            name: "nature-name",
            type: 3,
            description: "Get nature info by its English name.",
            required: true
        }]
    }, {
        name: "pokemon",
        type: 1,
        description: "Get info on a Pokémon.",
        options: [{
            name: "pokemon-name",
            type: 3,
            description: "Get Pokémon info by its English name.",
            required: true
        }]
    }]
};