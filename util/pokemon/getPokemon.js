module.exports = async (client, message, pokemon) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../sendMessage');
        const Discord = require("discord.js");
        const { Dex } = require('pokemon-showdown');
        const correctionID = require('../../objects/pokemon/correctionID.json');

        const typeMatchups = require('../../objects/pokemon/typeMatchups.json');
        const getTypeEmotes = require('./getTypeEmotes');

        if (!pokemon) return;

        // Typing
        let type1 = pokemon.types[0];
        let type2 = pokemon.types[1];
        let typeString = await getTypeEmotes(type1, type2);

        // Check type matchups
        let superEffectives = "";
        let resistances = "";
        let immunities = "";

        for (let [key, type] of Object.entries(typeMatchups)) {
            let typeName = key;

            // Dual type Pokemon
            if (pokemon.types[1]) {
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

        var pokemonID = leadingZeros(pokemon.num.toString());

        // Forms
        const alolaString = "-Alola";
        const galarString = "-Galar";
        const megaString = "-Mega";
        const primalString = "-Primal";
        const gmaxString = "-Gmax";
        const eternamaxString = "-Eternamax";
        const alolaBool = pokemon.name.endsWith(alolaString);
        const galarBool = pokemon.name.endsWith(galarString);
        const megaBool = pokemon.name.endsWith(megaString);
        const primalBool = pokemon.name.endsWith(primalString);
        const gmaxBool = pokemon.name.endsWith(gmaxString);
        const eternamaxBool = pokemon.name.endsWith(eternamaxString);
        let formChar;

        if (alolaBool || galarBool || megaBool || primalBool || gmaxBool || eternamaxBool) {
            if (alolaBool) formChar = "-a";
            if (galarBool) formChar = "-g";
            if (megaBool || primalBool) formChar = "-m";
            if (gmaxBool) formChar = "-gi";
            if (eternamaxBool) formChar = "-e";
            pokemonID = `${pokemonID}${formChar}`;
        };

        // Metrics
        let metricsString = "";
        if (pokemon.weightkg) metricsString = `Weight: ${pokemon.weightkg}kg`;
        if (pokemon.weightkg && pokemon.heightm) metricsString = `${metricsString}\n`;
        if (pokemon.heightm) metricsString = `${metricsString}Height: ${pokemon.heightm}m`;
        if (gmaxBool || eternamaxBool) metricsString = "";

        // edgecase ID corrections
        await correctValue(correctionID, pokemon.name, pokemonID);

        // Official art
        let banner = `https://www.serebii.net/pokemon/art/${pokemonID}.png`; // Use Serebii images
        // let banner = pokemon.sprites.other.home.front_default; // Use Home renders

        // Shuffle icons, only works for pokemon in pokemon shuffle
        let icon = `https://www.pkparaiso.com/imagenes/shuffle/sprites/${pokemonID}.png`;
        // Lower res party sprites from smogon, but work for all pokemon (but different naming convention, fuck smogon)
        // let icon = `https://www.smogon.com/forums//media/minisprites/${pokemon.name}.png`;
        // Gen 8 party icons, filled with gen 7 icons where needed, very small
        let iconParty = `https://github.com/msikma/pokesprite/blob/master/icons/pokemon/regular/${pokemon.name.toLowerCase()}.png?raw=true`;

        // High res SwSh sprites
        let sprite = `https://www.serebii.net/Shiny/SWSH/${pokemonID}.png`;

        let abilityString = pokemon.abilities['0'];
        if (pokemon.abilities['1']) abilityString = `${abilityString}\n${pokemon.abilities['1']}`;
        if (pokemon.abilities.H) {
            if (pokemon.unreleasedHidden) {
                abilityString = `${abilityString}\n${pokemon.abilities.H} (Unreleased Hidden)`;
            } else {
                abilityString = `${abilityString}\n${pokemon.abilities.H} (Hidden)`;
            };
        };

        let statLevels = `(50) (100)`;

        let HPstats = calcHP(pokemon.baseStats.hp);
        let Atkstats = calcStat(pokemon.baseStats.atk);
        let Defstats = calcStat(pokemon.baseStats.def);
        let SpAstats = calcStat(pokemon.baseStats.spa);
        let SpDstats = calcStat(pokemon.baseStats.spd);
        let Spestats = calcStat(pokemon.baseStats.spe);

        // Embed building
        const pkmEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor({ name: `${pokemonID.toUpperCase()}: ${pokemon.name}`, iconURL: iconParty })
            .setThumbnail(sprite)
            .addField("Type:", typeString, true);
        if (metricsString.length > 0) pkmEmbed.addField("Metrics:", metricsString, true);
        pkmEmbed
            .addField("Abilities:", abilityString, false);
        if (superEffectives.length > 0) pkmEmbed.addField("Weaknesses:", superEffectives, false);
        if (resistances.length > 0) pkmEmbed.addField("Resistances:", resistances, false);
        if (immunities.length > 0) pkmEmbed.addField("Immunities:", immunities, false);
        pkmEmbed
            .addField(`Stats: ${statLevels}`, `HP: **${pokemon.baseStats.hp}** ${HPstats}
Atk: **${pokemon.baseStats.atk}** ${Atkstats}
Def: **${pokemon.baseStats.def}** ${Defstats}
SpA: **${pokemon.baseStats.spa}** ${SpAstats}
SpD: **${pokemon.baseStats.spd}** ${SpDstats}
Spe: **${pokemon.baseStats.spe}** ${Spestats}
BST: ${pokemon.bst}`, false)
            .setImage(banner)
            .setFooter({ text: message.member.user.tag, iconURL: icon })
            .setTimestamp();

        let previousPokemon = null;
        let nextPokemon = null;
        let maxPkmID = 898; // Calyrex

        let allPokemon = Dex.species.all();

        let previousPokemonID = pokemon.num - 1;
        let nextPokemonID = pokemon.num + 1;
        if (previousPokemonID < 1) previousPokemonID = maxPkmID;
        if (nextPokemonID > maxPkmID) nextPokemonID = 1;

        previousPokemon = allPokemon.filter(pokemon => pokemon.num == previousPokemonID)[0];
        nextPokemon = allPokemon.filter(pokemon => pokemon.num == nextPokemonID)[0];

        // Buttons
        let pkmButtons = new Discord.MessageActionRow()
            .addComponents(new Discord.MessageButton({ customId: 'pkmleft', style: 'PRIMARY', emoji: '⬅️', label: previousPokemon.name }));

        if (pokemon.name !== pokemon.baseSpecies) pkmButtons.addComponents(new Discord.MessageButton({ customId: 'pkmbase', style: 'PRIMARY', emoji: '⬇️', label: pokemon.baseSpecies }));

        pkmButtons.addComponents(new Discord.MessageButton({ customId: 'pkmright', style: 'PRIMARY', emoji: '➡️', label: nextPokemon.name }));

        let formButtons = new Discord.MessageActionRow();
        if (pokemon.otherFormes && pokemon.otherFormes.length > 0) {
            if (pokemon.otherFormes.length > 0) {
                if (pokemon.otherFormes.length < 6) {
                    for (let i = 0; i < pokemon.otherFormes.length; i++) {
                        formButtons.addComponents(new Discord.MessageButton({ customId: `pkmForm${i}`, style: 'SECONDARY', label: pokemon.otherFormes[i] }));
                    };
                    // Pokémon with way too many forms
                } else {

                };
            };
        };

        console.log(pokemon)

        let buttonArray = [];
        if (formButtons.components.length > 0) buttonArray.push(formButtons);
        buttonArray.push(pkmButtons);

        let messageObject = { embed: pkmEmbed, buttons: buttonArray };
        return messageObject;

        function calcHP(base) {
            //// Gen 1-2
            // let min50 = Math.floor(((((base) * 2) * 50) / 100) + 50 + 10);
            // let max50 = Math.floor((((((base + 15) * 2) + Math.sqrt(65535) / 4) * 50) / 100) + 50 + 10);
            // let min100 = Math.floor(((((base) * 2) * 100) / 100) + 100 + 10);
            // let max100 = Math.floor((((((base + 15) * 2) + Math.sqrt(65535) / 4) * 100) / 100) + 100 + 10);
            //// Gen 3+
            let min50 = Math.floor((((2 * base) * 50) / 100) + 50 + 10);
            let max50 = Math.floor((((2 * base + 31 + (252 / 4)) * 50) / 100) + 50 + 10);
            let min100 = Math.floor((((2 * base) * 100) / 100) + 100 + 10);
            let max100 = Math.floor((((2 * base + 31 + (252 / 4)) * 100) / 100) + 100 + 10);
            //// Let's Go
            // let min50 = Math.floor((((2 * base) * 50) / 100) + 50 + 10);
            // let max50 = Math.floor((((2 * base + 31) * 50) / 100) + 50 + 10 + 200);
            // let min100 = Math.floor((((2 * base) * 100) / 100) + 100 + 10);
            // let max100 = Math.floor((((2 * base + 31) * 100) / 100) + 100 + 10 + 200);
            //// Legends: Arceus
            // let min50 = Math.floor((50 / 100 + 1) * base + 50 + (50 / 2.5));
            // let max50 = Math.floor((50 / 100 + 1) * base + 50 + Math.round((Math.sqrt(base) * 25 + 50) / 2.5));
            // let min100 = Math.floor((100 / 100 + 1) * base + 100 + (50 / 2.5));
            // let max100 = Math.floor((100 / 100 + 1) * base + 100 + Math.round((Math.sqrt(base) * 25 + 50) / 2.5));

            let StatText = `(${min50}-${max50}) (${min100}-${max100})`;
            if (pokemon.name.endsWith("-Gmax") || pokemon.name.endsWith("-Eternamax")) StatText = `(${Math.floor(min50 * 1.5)}-${max50 * 2}) (${Math.floor(min100 * 1.5)}-${max100 * 2})`;
            if (pokemon.name == "Shedinja") StatText = `(1-1) (1-1)`;
            return StatText;
        };

        function calcStat(base) {
            //// Gen 1-2
            // let min50 = Math.floor(((((base) * 2) * 50) / 100) + 5);
            // let max50 = Math.floor((((((base + 15) * 2) + Math.sqrt(65535) / 4) * 50) / 100) + 5);
            // let min100 = Math.floor(((((base) * 2) * 100) / 100) + 5);
            // let max100 = Math.floor((((((base + 15) * 2) + Math.sqrt(65535) / 4) * 100) / 100) + 5);
            //// Gen 3+
            let min50 = Math.floor(((((2 * base) * 50) / 100) + 5) * 0.9);
            let max50 = Math.floor(((((2 * base + 31 + (252 / 4)) * 50) / 100) + 5) * 1.1);
            let min100 = Math.floor(((((2 * base) * 100) / 100) + 5) * 0.9);
            let max100 = Math.floor(((((2 * base + 31 + (252 / 4)) * 100) / 100) + 5) * 1.1);
            //// Let's Go
            // let min50 = Math.floor((((2 * base) * 50) / 100) + 5);
            // let max50 = Math.floor((((((2 * base + 31) * 50) / 100) + 5) * 1.1 * 1.1) + 200);
            // let min100 = Math.floor((((2 * base) * 100) / 100) + 5);
            // let max100 = Math.floor((((((2 * base + 31) * 100) / 100) + 5) * 1.1 * 1.1) + 200);
            //// Legends: Arceus
            // let min50 = Math.floor((((50 / 50 + 1) * base) / 1.5) + (50 / 2.5));
            // let max50 = Math.floor(((((50 / 50 + 1) * base) / 1.5) * 1.1) + Math.round((Math.sqrt(base) * 25 + 50) / 2.5));
            // let min100 = Math.floor((((100 / 50 + 1) * base) / 1.5) + (50 / 2.5));
            // let max100 = Math.floor(((((100 / 50 + 1) * base) / 1.5) * 1.1) + Math.round((Math.sqrt(base) * 25 + 50) / 2.5));

            let StatText = `(${min50}-${max50}) (${min100}-${max100})`;
            return StatText;
        };

        function leadingZeros(str) {
            for (var i = str.length; i < 3; i++) {
                str = "0" + str;
            };
            return str;
        };

        async function correctValue(object, pokemonName, input) {
            var uncorrectedNames = Object.keys(object);
            uncorrectedNames.forEach(function (key) {
                pokemonName = pokemonName.toLowerCase();
                if (pokemonName == key) {
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