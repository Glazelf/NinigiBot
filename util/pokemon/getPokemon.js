module.exports = async (client, message, response) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../sendMessage');
        const Discord = require("discord.js");
        var Pokedex = require('pokedex-promise-v2');
        var P = new Pokedex();
        const correctionDisplay = require('../../objects/pokemon/correctionDisplay.json');
        const correctionID = require('../../objects/pokemon/correctionID.json');
        const typeMatchups = require('../../objects/pokemon/typeMatchups.json');
        const getTypeEmotes = require('./getTypeEmotes');
        const capitalizeString = require('./capitalizeString');

        if (!response) return;

        // Correct name when searching by ID
        pokemonName = response.name;

        // Typing
        let typeString = "";
        let type1 = response.types[0].type.name;
        if (response.types[1]) {
            var type2 = response.types[1].type.name;
            typeString = await getTypeEmotes(type1, type2);
        } else {
            typeString = await getTypeEmotes(type1);
        };

        // Check type matchups
        let superEffectives = "";
        let resistances = "";
        let immunities = "";

        for (let [key, type] of Object.entries(typeMatchups)) {
            let typeName = key;

            // Dual type Pokemon
            if (response.types[1]) {
                if (type.se.includes(type1)) type.effect += 1;
                if (type.se.includes(type2)) type.effect += 1;
                if (type.res.includes(type1)) type.effect += -1;
                if (type.res.includes(type2)) type.effect += -1;
                if (type.immune.includes(type1) || type.immune.includes(type2)) type.effect = -3;
                if (type.effect == 2 || type.effect == -2) {
                    typeName = await getTypeEmotes(typeName, null, true);
                } else {
                    typeName = await getTypeEmotes(typeName);
                };
                if (type.effect == 1 || type.effect == 2) {
                    if (superEffectives.length == 0) {
                        superEffectives = typeName;
                    } else {
                        superEffectives = `${superEffectives}, ${typeName}`;
                    };
                };
                if (type.effect == -1 || type.effect == -2) {
                    if (resistances.length == 0) {
                        resistances = typeName;
                    } else {
                        resistances = `${resistances}, ${typeName}`;
                    };
                };
                if (type.effect == -3) {
                    if (immunities.length == 0) {
                        immunities = typeName;
                    } else {
                        immunities = `${immunities}, ${typeName}`;
                    };
                };
                type.effect = 0;

                // Single type Pokemon
            } else {
                if (type.se.includes(type1)) {
                    if (superEffectives.length == 0) {
                        superEffectives = await getTypeEmotes(typeName);
                    } else {
                        let typeEmote = await getTypeEmotes(typeName);
                        superEffectives = `${superEffectives}, ${typeEmote}`;
                    };
                };
                if (type.res.includes(type1)) {
                    if (resistances.length == 0) {
                        resistances = await getTypeEmotes(typeName);
                    } else {
                        let typeEmote = await getTypeEmotes(typeName);
                        resistances = `${resistances}, ${typeEmote}`;
                    };
                };
                if (type.immune.includes(type1)) {
                    if (immunities.length == 0) {
                        immunities = await getTypeEmotes(typeName);
                    } else {
                        let typeEmote = await getTypeEmotes(typeName);
                        immunities = `${immunities}, ${typeEmote}`;
                    };
                };
            };
        };

        pokemonID = leadingZeros(response.id.toString());

        // Forms
        const alolaString = "-alola";
        const galarString = "-galar";
        const megaString = "-mega";
        const primalString = "-primal";
        const gmaxString = "-gmax";
        const eternamaxString = "-eternamax";
        const alolaBool = pokemonName.endsWith(alolaString);
        const galarBool = pokemonName.endsWith(galarString);
        const megaBool = pokemonName.endsWith(megaString);
        const primalBool = pokemonName.endsWith(primalString);
        const gmaxBool = pokemonName.endsWith(gmaxString);
        const eternamaxBool = pokemonName.endsWith(eternamaxString);
        let formChar;

        if (alolaBool || galarBool || megaBool || primalBool || gmaxBool) {
            if (alolaBool) {
                formChar = "-a";
            };
            if (galarBool) {
                formChar = "-g";
            };
            if (megaBool || primalBool) {
                formChar = "-m";
            };
            if (gmaxBool) {
                formChar = "-gi";
            };
            let baseName = pokemonName.replace("-alola", "").replace("-galar", "").replace("-mega", "").replace("-primal", "").replace("-gmax", "");
            await P.getPokemonByName(baseName)
                .then(function (responseForm) {
                    let formID = leadingZeros(responseForm.id.toString());
                    pokemonID = `${formID}${formChar}`;
                })
                .catch(function (e) {
                    // console.log(e);
                    return sendMessage(client, message, `Could not find the specified Pokémon.`);
                });
        };

        // Metrics
        let weight = `${response.weight / 10}kg`;
        let height = `${response.height / 10}m`;
        if (gmaxBool || eternamaxBool) weight = "???kg";

        // edgecase ID corrections, should be put in a JSON sometime. Delta is a nerd.
        await correctValue(correctionID, pokemonID);

        // ID and get Species Info, currently unused
        // let numericID = pokemonID.replace(/\D/g, '');
        // let speciesInfo = await (await fetch(`https://pokeapi.co/api/v2/pokemon-species/${numericID}/`)).json();

        // Official art
        let banner = `https://www.serebii.net/pokemon/art/${pokemonID}.png`;

        // Shuffle icons, only works for pokemon in pokemon shuffle
        let icon = `https://www.pkparaiso.com/imagenes/shuffle/sprites/${pokemonID}.png`;
        // Lower res party sprites from smogon, but work for all pokemon (but different naming convention, fuck smogon)
        //let icon = `https://www.smogon.com/forums//media/minisprites/${pokemonName}.png`;

        // High res SwSh sprites
        let sprite = `https://www.serebii.net/Shiny/SWSH/${pokemonID}.png`;

        let abilityString = ``;
        if (response.abilities[0]) {
            abilityString = `${response.abilities[0].ability.name}`;
            if (response.abilities[1]) {
                if (response.abilities[1].is_hidden == true) {
                    abilityString += `\n${response.abilities[1].ability.name} (Hidden)`;
                } else {
                    abilityString += `\n${response.abilities[1].ability.name}`;
                };
            };
            if (response.abilities[2]) {
                if (response.abilities[2].is_hidden == true) {
                    abilityString += `\n${response.abilities[2].ability.name} (Hidden)`;
                } else {
                    abilityString += `\n${response.abilities[2].ability.name}`;
                };
            };
        };

        let statLevels = `(50) (100)`;
        let baseHP = response.stats[0].base_stat;
        let baseAtk = response.stats[1].base_stat;
        let baseDef = response.stats[2].base_stat;
        let baseSpA = response.stats[3].base_stat;
        let baseSpD = response.stats[4].base_stat;
        let baseSpe = response.stats[5].base_stat;
        let BST = baseHP + baseAtk + baseDef + baseSpA + baseSpD + baseSpe;

        let HPstats = calcHP(baseHP);
        let Atkstats = calcStat(baseAtk);
        let Defstats = calcStat(baseDef);
        let SpAstats = calcStat(baseSpA);
        let SpDstats = calcStat(baseSpD);
        let Spestats = calcStat(baseSpe);

        // Alter display Pokémon names
        await correctValue(correctionDisplay, pokemonName);

        pokemonName = await capitalizeString(pokemonName);
        let abilityStringCapitalized = await capitalizeAbilities(abilityString);

        let footer = message.member.user.tag;

        // Embed building
        const pkmEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(`${pokemonID.toUpperCase()}: ${pokemonName}`, icon)
            .setThumbnail(sprite)
            .addField("Type:", typeString, true)
            .addField("Metrics:", `Weight: ${weight}
Height: ${height}`, true);
        if (abilityString.length > 0) pkmEmbed.addField("Abilities:", abilityStringCapitalized, false);
        if (superEffectives.length > 0) pkmEmbed.addField("Weaknesses:", superEffectives, false);
        if (resistances.length > 0) pkmEmbed.addField("Resistances:", resistances, false);
        if (immunities.length > 0) pkmEmbed.addField("Immunities:", immunities, false);
        pkmEmbed
            .addField(`Stats: ${statLevels}`, `HP: **${baseHP}** ${HPstats}
Atk: **${baseAtk}** ${Atkstats}
Def: **${baseDef}** ${Defstats}
SpA: **${baseSpA}** ${SpAstats}
SpD: **${baseSpD}** ${SpDstats}
Spe: **${baseSpe}** ${Spestats}
BST: ${BST}`, false)
            .setImage(banner)
            .setFooter(footer)
            .setTimestamp();

        let previousPokemon = null;
        let nextPokemon = null;
        let previousPokemonName = null;
        let nextPokemonName = null;
        let firstPokemon = "Bulbasaur"; // First Pokémon in the Pokédex
        let finalPokemon = "Calyrex"; // Final Pokémon in the Pokédex
        let maxPkmID = 898; // Calyrex
        let searchIndex = pokemonID - 2; // List is indexed from 0, -1 for previous Pokémon and -1 to go from ID to index
        let searchAmount = 3;

        if (searchIndex < 0) {
            searchIndex = 0;
            searchAmount = 2;
        } else if (searchIndex > maxPkmID) searchIndex = response.species.url.replace("https://pokeapi.co/api/v2/pokemon-species/", "").replace("/", "") - 2;

        await P.getPokemonsList({ limit: searchAmount, offset: searchIndex }).then(async function (response) {
            previousPokemonName = response.results[0].name;
            if (response.results[2]) nextPokemonName = response.results[2].name;
            if (response.results[0].name == "bulbasaur") {
                previousPokemon = finalPokemon;
                nextPokemonName = response.results[1].name;
            };
            if (response.results[1].name == "calyrex") nextPokemon = firstPokemon;
            if (!previousPokemon) previousPokemon = await capitalizeString(previousPokemonName);
            if (!nextPokemon) nextPokemon = await capitalizeString(nextPokemonName);
        }).catch(function (e) {
            // console.log(e);
            previousPokemon = null;
            nextPokemon = null;
        });

        // Buttons
        let pkmButtons = new Discord.MessageActionRow()
            .addComponents(new Discord.MessageButton({ customId: 'pkmleft', style: 'PRIMARY', emoji: '⬅️', label: previousPokemon }))
            .addComponents(new Discord.MessageButton({ customId: 'pkmright', style: 'PRIMARY', emoji: '➡️', label: nextPokemon }));

        let messageObject = { embed: pkmEmbed, buttons: pkmButtons };
        return messageObject;

        function calcHP(base) {
            let min50 = Math.floor((((2 * base) * 50) / 100) + 50 + 10);
            let max50 = Math.floor((((2 * base + 31 + (252 / 4)) * 50) / 100) + 50 + 10);
            let min100 = Math.floor((((2 * base) * 100) / 100) + 100 + 10);
            let max100 = Math.floor((((2 * base + 31 + (252 / 4)) * 100) / 100) + 100 + 10);
            let StatText = `(${min50}-${max50}) (${min100}-${max100})`;
            if (pokemonName.endsWith("-gmax") || pokemonName.endsWith("-eternamax")) StatText = `(${Math.floor(min50 * 1.5)}-${max50 * 2}) (${Math.floor(min100 * 1.5)}-${max100 * 2})`;
            if (pokemonName == "shedinja") StatText = `(1-1) (1-1)`;
            return StatText;
        };

        function calcStat(base) {
            let min50 = Math.floor(((((2 * base) * 50) / 100) + 5) * 0.9);
            let max50 = Math.floor(((((2 * base + 31 + (252 / 4)) * 50) / 100) + 5) * 1.1);
            let min100 = Math.floor(((((2 * base) * 100) / 100) + 5) * 0.9);
            let max100 = Math.floor(((((2 * base + 31 + (252 / 4)) * 100) / 100) + 5) * 1.1);
            let StatText = `(${min50}-${max50}) (${min100}-${max100})`;
            return StatText;
        };

        async function capitalizeAbilities(str) {
            let abilitySplit = str.split('\n');
            let newArray = [];
            for (var i = 0; i < abilitySplit.length; i++) {
                let abilityTemp = await capitalizeString(abilitySplit[i])
                newArray.push(abilityTemp);
            };
            capitalizedAbilities = newArray.join('\n');
            return capitalizedAbilities;
        };

        function leadingZeros(str) {
            for (var i = str.length; i < 3; i++) {
                str = "0" + str;
            };
            return str;
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

    } catch (e) {
        // Log error
        const logger = require('../logger');

        logger(e, client);
    };
};