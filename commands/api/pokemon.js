exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        var Pokedex = require('pokedex-promise-v2');
        var P = new Pokedex();
        const correctionName = require('../../objects/pokemon/correctionName.json');
        const easterEggName = require('../../objects/pokemon/easterEggName.json');
        const getPokemon = require('../../util/pokemon/getPokemon');
        const getTypeEmotes = require('../../util/pokemon/getTypeEmotes');
        const capitalizeString = require('../../util/pokemon/capitalizeString');

        if (!args[0]) return sendMessage(client, message, `You need to provide either a subcommand or a Pokémon to look up.`);

        let subCommand = args[0].toLowerCase();
        let subArgument;
        if (args[1]) {
            subArgument = args.slice(1).join("-").replace(" ", "-").toLowerCase();
        };

        let user = message.member.user;

        switch (subCommand) {
            // Abilities
            case "ability":
                P.getAbilityByName(subArgument)
                    .then(async function (response) {
                        // Why are german entries still tagged as English?
                        // let englishEntry = response.effect_entries.find(element => element.language.name = "en");
                        // English entries always seem to be either the only or the last entry, so this should work. For now.
                        let abilityDescription;
                        let englishEntry = response.effect_entries[response.effect_entries.length - 1];

                        if (englishEntry) {
                            abilityDescription = englishEntry.short_effect;
                        } else {
                            englishEntry = response.flavor_text_entries[response.flavor_text_entries.length - 1];
                            abilityDescription = englishEntry.flavor_text;
                        };

                        let author = await capitalizeString(response.name);

                        const abilityEmbed = new Discord.MessageEmbed()
                            .setColor(globalVars.embedColor)
                            .setAuthor(author)
                            .addField("Description:", abilityDescription, false)
                            .setFooter(user.tag)
                            .setTimestamp();
                        return sendMessage(client, message, null, abilityEmbed);

                    }).catch(function (e) {
                        // console.log(e);
                        if (e.toString().includes("Missing Permissions")) {
                            return logger(e, client, message);
                        } else {
                            return sendMessage(client, message, `Could not find the specified ability.`);
                        };
                    });
                break;

            // Items
            case "item":
                P.getItemByName(subArgument)
                    .then(async function (response) {
                        let itemName = response.name.replace("-", "").toLowerCase();
                        let itemImage = `https://www.serebii.net/itemdex/sprites/pgl/${itemName}.png`;
                        let author = await capitalizeString(response.name);
                        let category = await capitalizeString(response.category.name);

                        const itemEmbed = new Discord.MessageEmbed()
                            .setColor(globalVars.embedColor)
                            .setAuthor(author)
                            .setThumbnail(response.sprites.default)
                            .addField("Category:", category, true)
                            .addField("Description:", response.effect_entries[0].short_effect, false)
                            .setImage(itemImage)
                            .setFooter(user.tag)
                            .setTimestamp();

                        return sendMessage(client, message, null, itemEmbed);

                    }).catch(function (e) {
                        // console.log(e);
                        if (e.toString().includes("Missing Permissions")) {
                            return logger(e, client, message);
                        } else {
                            return sendMessage(client, message, `Could not find the specified item.`);
                        };
                    });
                break;

            // Moves
            case "move":
                P.getMoveByName(subArgument)
                    .then(async function (response) {
                        let description;
                        try {
                            description = response.effect_entries[0].short_effect.replace("$effect_chance", response.effect_chance);
                        } catch (e) {
                            description = null;
                        };
                        let author = await capitalizeString(response.name);
                        let type = await getTypeEmotes(response.type.name);
                        let category = await capitalizeString(response.damage_class.name);
                        let target = await capitalizeString(response.target.name);

                        const moveEmbed = new Discord.MessageEmbed()
                            .setColor(globalVars.embedColor)
                            .setAuthor(author)
                            .addField("Type:", type, true)
                            .addField("Category:", category, true);
                        if (response.power) moveEmbed.addField("Power:", response.power.toString(), true);
                        if (response.accuracy) moveEmbed.addField("Accuracy:", `${response.accuracy}%`, true);
                        if (response.priority !== 0) moveEmbed.addField("Priority:", response.priority.toString(), true);
                        moveEmbed
                            .addField("Target:", target, true);
                        if (description) moveEmbed.addField("Description:", description, false);
                        moveEmbed
                            .setFooter(user.tag)
                            .setTimestamp();

                        return sendMessage(client, message, null, moveEmbed);

                    }).catch(function (e) {
                        // console.log(e);
                        if (e.toString().includes("Missing Permissions")) {
                            return logger(e, client, message);
                        } else {
                            return sendMessage(client, message, `Could not find the specified move.`);
                        };
                    });
                break;

            // Pokémon
            default:
                // Public variables
                var pokemonName = args;
                var pokemonID;

                // Catch Slash Command structure
                if (message.type == 'APPLICATION_COMMAND') pokemonName = pokemonName.slice(1);

                // Edgecase name corrections
                pokemonName = pokemonName.join("-").replace(" ", "-").replace(":", "").toLowerCase();
                await correctValue(correctionName, pokemonName);

                // Easter egg name aliases
                await correctValue(easterEggName, pokemonName);

                P.getPokemonByName(pokemonName)
                    .then(async function (response) {
                        // Log for testing, remove later
                        // console.log(response);

                        let pkmEmbed = await getPokemon(client, message, response);

                        // Buttons
                        let pkmButtons = new Discord.MessageActionRow()
                            .addComponents(new Discord.MessageButton({ customId: 'pkmleft', style: 'PRIMARY', emoji: '⬅️' }))
                            .addComponents(new Discord.MessageButton({ customId: 'pkmright', style: 'PRIMARY', emoji: '➡️' }));

                        return sendMessage(client, message, null, pkmEmbed, null, true, pkmButtons);

                    }).catch(function (e) {
                        // console.log(e);
                        if (e.toString().includes("Missing Permissions")) {
                            return logger(e, client, message);
                        } else {
                            return sendMessage(client, message, `Could not find the specified Pokémon.`);
                        };
                    });
                break;
        };

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
    options: [{
        name: "ability",
        type: "SUB_COMMAND",
        description: "Get info on an ability.",
        options: [{
            name: "ability-name",
            type: "STRING",
            description: "Get ability info by its English name.",
        }]
    }, {
        name: "item",
        type: "SUB_COMMAND",
        description: "Get info on an item.",
        options: [{
            name: "item-name",
            type: "STRING",
            description: "Get item info by its English name.",
        }]
    }, {
        name: "move",
        type: "SUB_COMMAND",
        description: "Get info on a move.",
        options: [{
            name: "move-name",
            type: "STRING",
            description: "Get move info by its English name.",
        }]
    }, {
        name: "pokemon",
        type: "SUB_COMMAND",
        description: "Get info on a Pokémon.",
        options: [{
            name: "pokemon-name",
            type: "STRING",
            description: "Get Pokémon info by its English name.",
        }, {
            name: "pokemon-id",
            type: "INTEGER",
            description: "Get Pokémon info by Pokédex number.",
        }]
    }]
};