exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
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
        const capitalizeString = require('../../util/pokemon/capitalizeString');
        const randomNumber = require('../../util/randomNumber');

        let argument = args[0].value.toLowerCase();

        let user = message.member.user;
        let arrowUp = "<:arrow_up_red:909901820732784640>";
        let arrowDown = "<:arrow_down_blue:909903420054437929>";

        switch (interaction.options._subcommand) {
            // Abilities
            case "ability":
                P.getAbilityByName(argument)
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
                        let abilityButtons = new Discord.MessageActionRow()
                            .addComponents(new Discord.MessageButton({ label: 'More info', style: 'LINK', url: `https://bulbapedia.bulbagarden.net/wiki/${nameBulbapedia}_(Ability)` }));

                        const abilityEmbed = new Discord.MessageEmbed()
                            .setColor(globalVars.embedColor)
                            .setAuthor({ name: abilityName })
                            .addField("Description:", abilityDescription, false)
                            .setFooter(user.tag)
                            .setTimestamp();

                        return sendMessage(client, message, null, abilityEmbed, null, null, abilityButtons);

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
                P.getItemByName(argument)
                    .then(async function (response) {
                        let itemName = response.name.replace("-", "").toLowerCase();
                        let itemImage = `https://www.serebii.net/itemdex/sprites/pgl/${itemName}.png`;
                        let itemAuthorName = await capitalizeString(response.name);
                        let nameBulbapedia = itemAuthorName.replaceAll(" ", "_");
                        let category = await capitalizeString(response.category.name);

                        let effectEntry = response.effect_entries.find(element => element.language.name == "en");
                        let description = effectEntry.short_effect;

                        // Buttons
                        let itemButtons = new Discord.MessageActionRow()
                            .addComponents(new Discord.MessageButton({ label: 'More info', style: 'LINK', url: `https://bulbapedia.bulbagarden.net/wiki/${nameBulbapedia}` }));

                        const itemEmbed = new Discord.MessageEmbed()
                            .setColor(globalVars.embedColor)
                            .setAuthor({ name: itemName })
                            .setThumbnail(response.sprites.default)
                            .addField("Category:", category, true)
                            .addField("Description:", description, false)
                            .setImage(itemImage)
                            .setFooter(user.tag)
                            .setTimestamp();

                        return sendMessage(client, message, null, itemEmbed, null, null, itemButtons);

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
                P.getMoveByName(argument)
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

                        // Buttons
                        let moveButtons = new Discord.MessageActionRow()
                            .addComponents(new Discord.MessageButton({ label: 'More info', style: 'LINK', url: `https://bulbapedia.bulbagarden.net/wiki/${nameBulbapedia}_(move)` }));

                        const moveEmbed = new Discord.MessageEmbed()
                            .setColor(globalVars.embedColor)
                            .setAuthor({ name: moveName })
                            .addField("Type:", type, true)
                            .addField("Category:", category, true);
                        if (response.power) moveEmbed.addField("Power:", response.power.toString(), true);
                        if (response.accuracy) moveEmbed.addField("Accuracy:", `${response.accuracy}%`, true);
                        if (response.pp) moveEmbed.addField("PP:", ppString, true)
                        if (response.priority !== 0) moveEmbed.addField("Priority:", response.priority.toString(), true);
                        moveEmbed
                            .addField("Target:", target, true);
                        if (description) moveEmbed.addField("Description:", description, false);
                        moveEmbed
                            .setFooter(user.tag)
                            .setTimestamp();

                        return sendMessage(client, message, null, moveEmbed, null, null, moveButtons);

                    }).catch(function (e) {
                        // console.log(e);
                        if (e.toString().includes("Missing Permissions")) {
                            return logger(e, client, message);
                        } else {
                            return sendMessage(client, message, `Could not find the specified move.`);
                        };
                    });
                break;

            case "nature":
                P.getNatureByName(argument)
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

                        const natureEmbed = new Discord.MessageEmbed()
                            .setColor(globalVars.embedColor)
                            .setAuthor({ name: author })
                            .addField("Stats:", statString)
                            .addField("Flavours:", flavourString)
                            .setFooter(user.tag)
                            .setTimestamp();

                        return sendMessage(client, message, null, natureEmbed);

                    }).catch(function (e) {
                        // console.log(e);
                        if (e.toString().includes("Missing Permissions")) {
                            return logger(e, client, message);
                        } else {
                            return sendMessage(client, message, `Could not find the specified nature.`);
                        };
                    });
                break;

            // Pokémon
            case "pokemon":
                // Public variables
                var pokemonName = args;
                var pokemonID;

                let minPkmID = 1; // Bulbasaur
                let maxPkmID = 898; // Calyrex

                // Edgecase name corrections
                pokemonName = pokemonName.replace(" ", "-").replace(":", "").toLowerCase();
                await correctValue(correctionName, pokemonName);

                // Easter egg name aliases
                await correctValue(easterEggName, pokemonName);

                // Random Pokémon if argument is "random"
                let randomID = await randomNumber(minPkmID, maxPkmID);
                if (pokemonName.toLowerCase() == "random") pokemonName = randomID;

                P.getPokemonByName(pokemonName)
                    .then(async function (response) {
                        let messageObject = await getPokemon(client, message, response);
                        return sendMessage(client, message, null, messageObject.embed, null, true, messageObject.buttons);

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
            required: true
        }]
    }, {
        name: "item",
        type: "SUB_COMMAND",
        description: "Get info on an item.",
        options: [{
            name: "item-name",
            type: "STRING",
            description: "Get item info by its English name.",
            required: true
        }]
    }, {
        name: "move",
        type: "SUB_COMMAND",
        description: "Get info on a move.",
        options: [{
            name: "move-name",
            type: "STRING",
            description: "Get move info by its English name.",
            required: true
        }]
    }, {
        name: "nature",
        type: "SUB_COMMAND",
        description: "Get info on a nature.",
        options: [{
            name: "nature-name",
            type: "STRING",
            description: "Get nature info by its English name.",
            required: true
        }]
    }, {
        name: "pokemon",
        type: "SUB_COMMAND",
        description: "Get info on a Pokémon.",
        options: [{
            name: "pokemon-name",
            type: "STRING",
            description: "Get Pokémon info by its English name.",
            required: true
        }]
    }]
};