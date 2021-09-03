exports.run = async (client, message, args = [], language) => {
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const getLanguageString = require('../../util/getLanguageString');
        const logger = require('../../util/logger');
        const Discord = require("discord.js");
        const fetch = require("node-fetch");
        var Pokedex = require('pokedex-promise-v2');
        var P = new Pokedex();
        const correctionName = require('../../objects/pokemon/correctionName.json');
        const easterEggName = require('../../objects/pokemon/easterEggName.json');
        const getPokemon = require('../../util/pokemon/getPokemon');
        const getTypeEmotes = require('../../util/pokemon/getTypeEmotes');
        const capitalizeString = require('../../util/pokemon/capitalizeString');

        let pokemonNoArgument = await getLanguageString(client, language, 'pokemonNoArgument');
        if (!args[0]) return sendMessage(client, message, pokemonNoArgument);

        let subCommand = args[0].toLowerCase();
        let subArgument;
        if (args[1]) {
            subArgument = args.slice(1).join("-").replace(" ", "-").toLowerCase();
        };

        let user;
        if (message.type == 'DEFAULT') {
            user = message.author;
        } else {
            user = message.member.user;

        };

        switch (subCommand) {
            case "ability":
                P.getAbilityByName(subArgument)
                    .then(async function (response) {
                        // Why are german entries still tagged as English?
                        // let englishEntry = response.effect_entries.find(element => element.language.name = "en");
                        // English entries always seem to be either the only or the last entry, so this should work. For now.
                        let englishEntry = response.effect_entries[response.effect_entries.length - 1];
                        let author = await capitalizeString(response.name);

                        const abilityEmbed = new Discord.MessageEmbed()
                            .setColor(globalVars.embedColor)
                            .setAuthor(author)
                            .addField("Description:", englishEntry.short_effect, false)
                            .setFooter(user.tag)
                            .setTimestamp();
                        return sendMessage(client, message, null, abilityEmbed);

                    }).catch(async function (e) {
                        // console.log(e);
                        if (e.toString().includes("Missing Permissions")) {
                            return logger(e, client, message);
                        } else {
                            let pokemonUndefinedAbility = await getLanguageString(client, language, 'pokemonUndefinedAbility');
                            return sendMessage(client, message, pokemonUndefinedAbility);
                        };
                    });
                break;

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

                    }).catch(async function (e) {
                        // console.log(e);
                        if (e.toString().includes("Missing Permissions")) {
                            return logger(e, client, message);
                        } else {
                            let pokemonUndefinedItem = await getLanguageString(client, language, 'pokemonUndefinedItem');
                            return sendMessage(client, message, pokemonUndefinedItem);
                        };
                    });
                break;

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

                        let pokemonTitleType = await getLanguageString(client, language, 'pokemonTitleType');
                        let pokemonTitleCategory = await getLanguageString(client, language, 'pokemonTitleCategory');
                        let pokemonTitlePower = await getLanguageString(client, language, 'pokemonTitlePower');
                        let pokemonTitleAccuracy = await getLanguageString(client, language, 'pokemonTitleAccuracy');
                        let pokemonTitlePriority = await getLanguageString(client, language, 'pokemonTitlePriority');
                        let pokemonTitleTarget = await getLanguageString(client, language, 'pokemonTitleTarget');
                        let pokemonTitleDescription = await getLanguageString(client, language, 'pokemonTitleDescription');

                        const moveEmbed = new Discord.MessageEmbed()
                            .setColor(globalVars.embedColor)
                            .setAuthor(author)
                            .addField(pokemonTitleType, type, true)
                            .addField(pokemonTitleCategory, category, true);
                        if (response.power) moveEmbed.addField(pokemonTitlePower, response.power.toString(), true);
                        if (response.accuracy) moveEmbed.addField(pokemonTitleAccuracy, `${response.accuracy}%`, true);
                        if (response.priority !== 0) moveEmbed.addField(pokemonTitlePriority, response.priority.toString(), true);
                        moveEmbed
                            .addField(pokemonTitleTarget, target, true);
                        if (description) moveEmbed.addField(pokemonTitleDescription, description, false);
                        moveEmbed
                            .setFooter(user.tag)
                            .setTimestamp();

                        return sendMessage(client, message, null, moveEmbed);

                    }).catch(async function (e) {
                        // console.log(e);
                        if (e.toString().includes("Missing Permissions")) {
                            return logger(e, client, message);
                        } else {
                            let pokemonUndefinedMove = await getLanguageString(client, language, 'pokemonUndefinedMove');
                            return sendMessage(client, message, pokemonUndefinedMove);
                        };
                    });
                break;

            default:
                // Public variables
                var pokemonName;
                var pokemonID;

                // Catch Slash Command structure
                if (message.type == 'APPLICATION_COMMAND') {
                    pokemonName = args.slice(1).join("-").replace(" ", "-").toLowerCase();
                } else {
                    pokemonName = args.join(" ").toLowerCase();
                };

                // Edgecase name corrections
                if (pokemonName.startsWith("tapu") || pokemonName == "type null") pokemonName = `${args[0]}-${args[1]}`;
                if (pokemonName == "type: null") pokemonName = `${args[0].substring(0, args[0].length - 1)}-${args[1]}`;
                await correctValue(correctionName, pokemonName);

                // Easter egg name aliases
                await correctValue(easterEggName, pokemonName);


                P.getPokemonByName(pokemonName)
                    .then(async function (response) {
                        // Log for testing, remove later
                        // console.log(response);

                        let pkmEmbed = await getPokemon(client, message, response, null, language);

                        // Buttons
                        let pkmButtons = new Discord.MessageActionRow()
                            .addComponents(new Discord.MessageButton({ customId: 'pkmleft', style: 'PRIMARY', emoji: '⬅️' }))
                            .addComponents(new Discord.MessageButton({ customId: 'pkmright', style: 'PRIMARY', emoji: '➡️' }));

                        return sendMessage(client, message, null, pkmEmbed, null, true, pkmButtons);

                    }).catch(async function (e) {
                        // console.log(e);
                        if (e.toString().includes("Missing Permissions")) {
                            return logger(e, client, message);
                        } else {
                            let pokemonUndefinedPokemon = await getLanguageString(client, language, 'pokemonUndefinedPokemon');
                            return sendMessage(client, message, pokemonUndefinedPokemon);
                        };
                    });
                break;
        };

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
        // log error
        const logger = require('../../util/logger');

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
            description: "Get ability info by English name.",
        }]
    }, {
        name: "item",
        type: "SUB_COMMAND",
        description: "Get info on an item.",
        options: [{
            name: "item-name",
            type: "STRING",
            description: "Get item info by English name.",
        }]
    }, {
        name: "move",
        type: "SUB_COMMAND",
        description: "Get info on a move.",
        options: [{
            name: "move-name",
            type: "STRING",
            description: "Get move info by English name.",
        }]
    }, {
        name: "pokemon",
        type: "SUB_COMMAND",
        description: "Get info on a Pokémon.",
        options: [{
            name: "pokemon-name",
            type: "STRING",
            description: "Get Pokémon info by English name.",
        }, {
            name: "pokemon-id",
            type: "INTEGER",
            description: "Get Pokémon info by Pokédex number.",
        }]
    }]
};