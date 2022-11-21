module.exports = async (client, interaction, pokemon, ephemeral) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../sendMessage');
        const Discord = require("discord.js");
        const { Dex } = require('pokemon-showdown');
        const imageExists = require('../imageExists');
        const isAdmin = require('../isAdmin');
        const correctionID = require('../../objects/pokemon/correctionID.json');
        const colorHexes = require('../../objects/colorHexes.json');
        const typeMatchups = require('../../objects/pokemon/typeMatchups.json');
        const getTypeEmotes = require('./getTypeEmotes');

        if (!pokemon) return;
        let description = "";
        let pokemonGender = "";
        if (pokemon.gender == "M") pokemonGender = "♂️";
        if (pokemon.gender == "F") pokemonGender = "♀️";

        let adminBot = isAdmin(client, interaction.guild.me)
        let emotesAllowed = true;
        if (ephemeral == true && !interaction.guild.me.permissions.has("USE_EXTERNAL_EMOJIS") && !adminBot) emotesAllowed = false;

        // Typing
        let type1 = pokemon.types[0];
        let type2 = pokemon.types[1];
        let typeString = await getTypeEmotes({ type1: type1, type2: type2, emotes: emotesAllowed });

        // Check type matchups, maybe use Dex.types sometime 
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
                    typeName = await getTypeEmotes({ type1: typeName, bold: true, emotes: emotesAllowed });
                } else {
                    typeName = await getTypeEmotes({ type1: typeName, emotes: emotesAllowed });
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
                        superEffectives = await getTypeEmotes({ type1: typeName, emotes: emotesAllowed });
                    } else {
                        let typeEmote = await getTypeEmotes({ type1: typeName, emotes: emotesAllowed });
                        superEffectives = `${superEffectives}, ${typeEmote}`;
                    };
                };
                if (type.res.includes(type1)) {
                    if (resistances.length == 0) {
                        resistances = await getTypeEmotes({ type1: typeName, emotes: emotesAllowed });
                    } else {
                        let typeEmote = await getTypeEmotes({ type1: typeName, emotes: emotesAllowed });
                        resistances = `${resistances}, ${typeEmote}`;
                    };
                };
                if (type.immune.includes(type1)) {
                    if (immunities.length == 0) {
                        immunities = await getTypeEmotes({ type1: typeName, emotes: emotesAllowed });
                    } else {
                        let typeEmote = await getTypeEmotes({ type1: typeName, emotes: emotesAllowed });
                        immunities = `${immunities}, ${typeEmote}`;
                    };
                };
            };
        };

        var pokemonID = leadingZeros(pokemon.num.toString());
        // Forms
        const primalString = "-Primal";
        const totemString = "-Totem";
        const gmaxString = "-Gmax";
        const eternamaxString = "-Eternamax";
        const primalBool = pokemon.name.endsWith(primalString);
        const totemBool = pokemon.name.endsWith(totemString);
        const gmaxBool = pokemon.name.endsWith(gmaxString);
        const eternamaxBool = pokemon.name.endsWith(eternamaxString);
        const totemAlolaBool = totemBool && pokemon.name.split("-")[1] == "Alola";
        let formChar;

        if (primalBool || gmaxBool) {
            if (primalBool) formChar = "-m";
            if (gmaxBool) formChar = "-gi";
            pokemonID = `${pokemonID}${formChar}`;
        } else if (!totemBool || totemAlolaBool) {
            // Catches all forms where the form extension on Serebii is just the first letter of the form name
            if (pokemon.name.split("-")[1]) pokemonID = `${pokemonID}-${pokemon.name.split("-")[1].split("", 1)[0].toLowerCase()}`;
        };

        // edgecase ID corrections
        // TODO: add a bunch of meaningless forms like Unown and Vivillon
        await correctValue(correctionID, pokemon.name, pokemonID);
        if (pokemon.name.startsWith("Arceus-") || pokemon.name.startsWith("Silvally-")) pokemonID = `${pokemonID}-${pokemon.types[0].toLowerCase()}`;

        // Metrics
        let metricsString = "";
        if (pokemon.weightkg) metricsString = `Weight: ${pokemon.weightkg}kg`;
        if (pokemon.weightkg && pokemon.heightm) metricsString = `${metricsString}\n`;
        if (pokemon.heightm) metricsString = `${metricsString}Height: ${pokemon.heightm}m`;
        if (gmaxBool || eternamaxBool) metricsString = "";

        let urlName = encodeURIComponent(pokemon.name.toLowerCase().replace(" ", "-"));

        // Official art
        let render = `https://www.serebii.net/pokemon/art/${pokemonID}.png`;
        // Game render
        let renderGame = `https://www.serebii.net/swordshield/pokemon/${pokemonID}.png`;
        // PMD portraits
        let pokemonIDLength4 = (pokemonID.length < 4 ? '0' : '') + pokemonID; // Add leading zeroes
        let PMDPortrait = `https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/portrait/${pokemonIDLength4}/Normal.png`;
        let PMDPortraitExists = imageExists(PMDPortrait);
        // Small party icons
        let partyIcon = `https://www.serebii.net/pokedex-sv/icon/${pokemonID}.png`;
        let partyIconExists = imageExists(partyIcon);
        if (!partyIconExists) partyIcon = `https://www.serebii.net/pokedex-swsh/icon/${pokemonID}.png`;
        // Shiny render, currently unused
        // let shinyModel = `https://www.serebii.net/Shiny/SV/${pokemonID}.png`;
        // let shinyModelExists = imageExists(shinyModel);
        // if (!shinyModelExists) shinyModel = `https://www.serebii.net/Shiny/SWSH/${pokemonID}.png`;
        // let shinyModel = `https://play.pokemonshowdown.com/sprites/dex-shiny/${urlName}.png`; // Smaller, low-res

        let banner = render;
        let iconAuthor = PMDPortrait;
        let iconFooter = partyIcon;
        let iconThumbnail = render;
        if (!PMDPortraitExists) {
            iconAuthor = partyIcon;
            iconFooter = null;
        };

        let ability0Desc = Dex.abilities.get(pokemon.abilities[0]).shortDesc;
        let ability1Desc = Dex.abilities.get(pokemon.abilities[1]).shortDesc;
        let abilityString = `**${pokemon.abilities['0']}**: ${ability0Desc}`;
        if (pokemon.abilities['1']) abilityString += `\n**${pokemon.abilities['1']}**: ${ability1Desc}`;
        if (pokemon.abilities['H']) {
            let abilityHDesc = Dex.abilities.get(pokemon.abilities['H']).shortDesc;
            if (pokemon.unreleasedHidden) {
                abilityString += `\n**${pokemon.abilities['H']}** (Unreleased Hidden): ${abilityHDesc}`;
            } else {
                abilityString += `\n**${pokemon.abilities['H']}** (Hidden): ${abilityHDesc}`;
            };
        };
        if (pokemon.abilities['S']) {
            let abilitySDesc = Dex.abilities.get(pokemon.abilities['S']).shortDesc;
            abilityString += `\n**${pokemon.abilities['S']}** (Special): ${abilitySDesc}`;
        };

        let statLevels = `(50) (100)`;
        let HPstats = calcHP(pokemon.baseStats.hp);
        let Atkstats = calcStat(pokemon.baseStats.atk);
        let Defstats = calcStat(pokemon.baseStats.def);
        let SpAstats = calcStat(pokemon.baseStats.spa);
        let SpDstats = calcStat(pokemon.baseStats.spd);
        let Spestats = calcStat(pokemon.baseStats.spe);

        let embedColor = globalVars.embedColor;
        if (pokemon.color) {
            if (colorHexes[pokemon.color.toLowerCase()]) embedColor = colorHexes[pokemon.color.toLowerCase()];
        };

        let previousPokemon = null;
        let nextPokemon = null;
        let allPokemon = Dex.species.all();
        let allPokemonSorted = allPokemon.sort(compare);
        let maxPkmID = allPokemonSorted[allPokemonSorted.length - 1].num;

        let previousPokemonID = pokemon.num - 1;
        let nextPokemonID = pokemon.num + 1;
        if (previousPokemonID < 1) previousPokemonID = maxPkmID;
        if (nextPokemonID > maxPkmID) nextPokemonID = 1;

        previousPokemon = allPokemon.filter(pokemon => pokemon.num == previousPokemonID)[0];
        nextPokemon = allPokemon.filter(pokemon => pokemon.num == nextPokemonID)[0];
        // Skip placeholders, should clean this sometime but this code might become obsolete later in Showdown's SV support
        if (!previousPokemon) {
            previousPokemonID = previousPokemonID - 1;
            previousPokemon = allPokemon.filter(pokemon => pokemon.num == previousPokemonID)[0];
        };
        if (!nextPokemon) {
            nextPokemonID += 1;
            nextPokemon = allPokemon.filter(pokemon => pokemon.num == nextPokemonID)[0];
        };

        let pkmButtons = new Discord.MessageActionRow();
        if (previousPokemon) pkmButtons.addComponents(new Discord.MessageButton({ customId: 'pkmleft', style: 'PRIMARY', emoji: '⬅️', label: previousPokemon.name }));
        let pkmButtons2 = new Discord.MessageActionRow();

        if (pokemon.name !== pokemon.baseSpecies) pkmButtons.addComponents(new Discord.MessageButton({ customId: 'pkmbase', style: 'PRIMARY', emoji: '⬇️', label: pokemon.baseSpecies }));
        if (nextPokemon) pkmButtons.addComponents(new Discord.MessageButton({ customId: 'pkmright', style: 'PRIMARY', emoji: '➡️', label: nextPokemon.name }));
        if (pokemon.prevo) {
            let evoMethod = getEvoMethod(pokemon);
            description = `\nEvolves from ${pokemon.prevo}${pokemonGender}${evoMethod}.`;
            if (pokemon.prevo !== previousPokemon.name && pokemon.prevo !== nextPokemon.name) pkmButtons.addComponents(new Discord.MessageButton({ customId: `pkmprevo`, style: 'PRIMARY', emoji: '⏬', label: pokemon.prevo }));
        };
        for (let i = 0; i < pokemon.evos.length; i++) {
            let pokemonData = Dex.species.get(pokemon.evos[i]);
            let evoMethod = getEvoMethod(pokemonData);
            description += `\nEvolves into ${pokemon.evos[i]}${evoMethod}.`;
            if (pokemon.evos[i] !== previousPokemon.name && pokemon.evos[i] !== nextPokemon.name) {
                if (pkmButtons.components.length < 5) {
                    pkmButtons.addComponents(new Discord.MessageButton({ customId: `pkmevo${i + 1}`, style: 'PRIMARY', emoji: '⏫', label: pokemon.evos[i] }));
                } else {
                    // This exists solely because of Eevee
                    pkmButtons2.addComponents(new Discord.MessageButton({ customId: `pkmevo${i + 1}`, style: 'PRIMARY', emoji: '⏫', label: pokemon.evos[i] }));
                };
            };
        };

        let formButtons = new Discord.MessageActionRow();
        let pokemonForms = [];
        if (pokemon.otherFormes && pokemon.otherFormes.length > 0) pokemonForms = pokemon.otherFormes;
        if (pokemon.canGigantamax) pokemonForms.push(`${pokemon.name}-Gmax`);
        if (pokemonForms && pokemonForms.length > 0) {
            if (pokemonForms.length > 0) {
                if (pokemonForms.length < 6) {
                    for (let i = 0; i < pokemonForms.length; i++) {
                        formButtons.addComponents(new Discord.MessageButton({ customId: `pkmForm${i}`, style: 'SECONDARY', label: pokemonForms[i] }));
                    };
                } else {
                    // Pokémon with way too many forms
                    // Fuck you (for now)
                };
            };
        };

        let buttonArray = [];
        if (formButtons.components.length > 0) buttonArray.push(formButtons);
        buttonArray.push(pkmButtons);
        if (pkmButtons2.components.length > 0) buttonArray.push(pkmButtons2);

        // Embed building
        const pkmEmbed = new Discord.MessageEmbed()
            .setColor(embedColor)
            .setAuthor({ name: `${pokemonID.toUpperCase()}: ${pokemon.name}`, iconURL: iconAuthor })
            .setThumbnail(iconThumbnail)
            .setDescription(description)
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
            // .setImage(banner)
            .setFooter({ text: interaction.user.tag, iconURL: iconFooter })
            .setTimestamp();

        let messageObject = { embeds: pkmEmbed, components: buttonArray };
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

        function getEvoMethod(pokemon) {
            let evoMethod;
            switch (pokemon.evoType) {
                case "useItem":
                    evoMethod = ` using a ${pokemon.evoItem}`;
                    break;
                case "trade":
                    evoMethod = ` when traded`;
                    if (pokemon.evoItem) evoMethod += ` holding a ${pokemon.evoItem}`;
                    break;
                case "levelHold":
                    evoMethod = ` when leveling up while holding a ${pokemon.evoItem}`;
                    break;
                case "levelExtra":
                    evoMethod = ` when leveling up`;
                    break;
                case "levelFriendship":
                    evoMethod = ` when leveling up with high friendship`;
                    break;
                case "levelMove":
                    evoMethod = ` when leveling up while knowing ${pokemon.evoMove}`;
                    break;
                case "other":
                    evoMethod = `:`;
                    break;
                default:
                    evoMethod = ` at level ${pokemon.evoLevel}`;
                    break;
            };
            if (pokemon.evoCondition) evoMethod += ` ${pokemon.evoCondition}`;
            return evoMethod;
        };

        function compare(a, b) {
            return a.num - b.num;
        };

    } catch (e) {
        // Log error
        const logger = require('../logger');

        logger(e, client);
    };
};