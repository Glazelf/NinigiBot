module.exports = async ({ client, interaction, pokemon, learnsetBool = false, shinyBool = false, generation, ephemeral = true }) => {
    try {
        const Discord = require("discord.js");
        const { Dex } = require('pokemon-showdown');
        const imageExists = require('../imageExists');
        const isAdmin = require('../isAdmin');
        const convertMeterFeet = require('../convertMeterFeet');
        const leadingZeros = require('../leadingZeros');
        const getCleanPokemonID = require('./getCleanPokemonID.js');
        const colorHexes = require('../../objects/colorHexes.json');
        const typechart = require('../../node_modules/pokemon-showdown/dist/data/typechart.js').TypeChart;
        let learnsets = require('../../node_modules/pokemon-showdown/dist/data/learnsets.js').Learnsets;
        if (generation <= 2) learnsets = require('../../node_modules/pokemon-showdown/dist/data/mods/gen2/learnsets.js').Learnsets;
        const getTypeEmotes = require('./getTypeEmotes');
        const checkBaseSpeciesMoves = require('./checkBaseSpeciesMoves.js');
        // Common settings
        if (!pokemon) return;
        let adminBot = isAdmin(client, interaction.guild.members.me);
        let emotesAllowed = true;
        if (ephemeral == true && !interaction.guild.members.me.permissions.has(Discord.PermissionFlagsBits.UseExternalEmojis) && !adminBot) emotesAllowed = false;
        let recentGame = "SV";
        let description = "";
        let dexModified = Dex.mod(`gen${generation}`);
        // Gender studies
        let pokemonGender = "";
        let genderString = "";
        let iconMale = "♂️";
        let iconFemale = "♀️";
        switch (pokemon.gender) {
            case "M":
                pokemonGender = iconMale;
                genderString = `${iconMale} 100%`;
                break;
            case "F":
                pokemonGender = iconFemale;
                genderString = `${iconFemale} 100%`;
                break;
            case "N":
                genderString = "Unknown";
                break;
            default:
                genderString = `${iconMale} ${pokemon.genderRatio.M * 100}%\n${iconFemale} ${pokemon.genderRatio.F * 100}%`;
                break;
        };
        // Typing
        let type1 = pokemon.types[0];
        let type2 = pokemon.types[1];
        let typeString = getTypeEmotes({ type1: type1, type2: type2, emotes: emotesAllowed });
        // Check type matchups, maybe use dexModified.types sometime
        let typeEffectString = "";
        let superEffectives = [];
        let resistances = [];
        let immunities = [];
        let typeEffects = {};
        type1 = typechart[type1.toLowerCase()].damageTaken;
        if (pokemon.types[1]) type2 = typechart[type2.toLowerCase()].damageTaken;
        for (let [typeName, matchup] of Object.entries(type1)) {
            typeEffects[typeName] = 0;
            if (typeName[0] == typeName[0].toLowerCase()) continue; // Skip status effects like paralysis and poison
            if (matchup == 1) typeEffects[typeName] += 1;
            if (matchup == 2) typeEffects[typeName] += -1;
            if (matchup == 3) typeEffects[typeName] = -5;
            if (!pokemon.types[1]) {
                typeEffectString = getTypeEmotes({ type1: typeName, emotes: emotesAllowed });
                if (typeEffects[typeName] == 1) superEffectives.push(typeEffectString);
                if (typeEffects[typeName] == -1) resistances.push(typeEffectString);
                if (typeEffects[typeName] <= -3) immunities.push(typeEffectString);
            };
        };
        if (pokemon.types[1]) {
            for (let [typeName, matchup] of Object.entries(type2)) {
                if (typeName[0] == typeName[0].toLowerCase()) continue; // Skip status effects like paralysis and poison
                if (matchup == 1) typeEffects[typeName] += 1;
                if (matchup == 2) typeEffects[typeName] += -1;
                if (matchup == 3) typeEffects[typeName] = -5;
                // Should make the results functionality prettier sometime
                if (typeEffects[typeName] == 2 || typeEffects[typeName] == -2) {
                    typeEffectString = getTypeEmotes({ type1: typeName, bold: true, emotes: emotesAllowed });
                } else {
                    typeEffectString = getTypeEmotes({ type1: typeName, emotes: emotesAllowed });
                };
                if (typeEffects[typeName] == 1 || typeEffects[typeName] == 2) superEffectives.push(typeEffectString);
                if (typeEffects[typeName] == -1 || typeEffects[typeName] == -2) resistances.push(typeEffectString);
                if (typeEffects[typeName] <= -3) immunities.push(typeEffectString);
            };
        };
        superEffectives = superEffectives.join(", ");
        resistances = resistances.join(", ");
        immunities = immunities.join(", ");

        let pokemonID = getCleanPokemonID(pokemon);
        pokemonIDPMD = leadingZeros(pokemonID, 4); // Remove this when Showdown and Serebii switch to 4 digit IDs consistently as well
        // Metrics
        let metricsString = "";
        let weightAmerican = Math.round(pokemon.weightkg * 2.20462 * 10) / 10;
        let heightAmerican = convertMeterFeet(pokemon.heightm);
        if (pokemon.weightkg && pokemon.weightkg > 0) {
            metricsString += `**Weight:**\n${pokemon.weightkg}kg | ${weightAmerican}lbs`;
        } else {
            metricsString += `**Weight:**\n???`;
        };
        if (pokemon.heightm) {
            metricsString += `\n**Height:**\n${pokemon.heightm}m | ${heightAmerican}ft`;
        };
        // let urlName = encodeURIComponent(pokemon.name.toLowerCase().replace(" ", "-"));
        // Official art
        let render = `https://www.serebii.net/pokemon/art/${pokemonID}.png`;
        // Game render
        // let renderGame = `https://www.serebii.net/swordshield/pokemon/${pokemonID}.png`;
        // Shiny
        // PMD portraits
        let PMDPortrait = `https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/portrait/${pokemonIDPMD}/Normal.png`;
        let PMDPortraitExists = imageExists(PMDPortrait);
        // Small party icons
        let partyIcon = `https://www.serebii.net/pokedex-${recentGame.toLowerCase()}/icon/${pokemonID}.png`;
        // Shiny render
        let shinyRender = `https://www.serebii.net/Shiny/${recentGame}/${pokemonID}.png`;
        // let shinyRender = `https://play.pokemonshowdown.com/sprites/dex-shiny/${urlName}.png`; // Smaller, low-res render
        // April Fools Day sprites
        let afdSprite = `https://play.pokemonshowdown.com/sprites/afd/${pokemon.spriteid}.png`;
        if (shinyBool) afdSprite = afdSprite.replace("/afd/", "/afd-shiny/");

        let banner = render;
        let iconAuthor = PMDPortrait;
        let iconFooter = partyIcon;
        let iconThumbnail = render;
        // Check if date is march 31st to april 2nd for April Fools
        let date = new Date;
        let day = date.getDate();
        let month = date.getMonth() + 1;
        if ((month == 3 && day == 31) || (month == 4 && day <= 2)) iconThumbnail = afdSprite;

        if (shinyBool) iconThumbnail = shinyRender;
        if (!PMDPortraitExists) {
            iconAuthor = partyIcon;
            iconFooter = null;
        };
        let ability0Desc = dexModified.abilities.get(pokemon.abilities[0]).shortDesc;
        let ability1Desc = dexModified.abilities.get(pokemon.abilities[1]).shortDesc;
        let abilityString = `**${pokemon.abilities['0']}**: ${ability0Desc}`;
        if (pokemon.abilities['1']) abilityString += `\n**${pokemon.abilities['1']}**: ${ability1Desc}`;
        if (pokemon.abilities['H']) {
            let abilityHDesc = dexModified.abilities.get(pokemon.abilities['H']).shortDesc;
            if (pokemon.unreleasedHidden) {
                abilityString += `\n**${pokemon.abilities['H']}** (Unreleased Hidden): ${abilityHDesc}`;
            } else {
                abilityString += `\n**${pokemon.abilities['H']}** (Hidden): ${abilityHDesc}`;
            };
        };
        if (pokemon.abilities['S']) {
            let abilitySDesc = dexModified.abilities.get(pokemon.abilities['S']).shortDesc;
            abilityString += `\n**${pokemon.abilities['S']}** (Special): ${abilitySDesc}`;
        };
        let statLevels = `(lvl50) (lvl100)`;
        let HPstats = calcHP(pokemon.baseStats.hp, generation);
        let Atkstats = calcStat(pokemon.baseStats.atk, generation);
        let Defstats = calcStat(pokemon.baseStats.def, generation);
        let SpAstats = calcStat(pokemon.baseStats.spa, generation);
        let SpDstats = calcStat(pokemon.baseStats.spd, generation);
        let Spestats = calcStat(pokemon.baseStats.spe, generation);
        let statsString = `HP: **${pokemon.baseStats.hp}** ${HPstats}\nAtk: **${pokemon.baseStats.atk}** ${Atkstats}\nDef: **${pokemon.baseStats.def}** ${Defstats}\n`;
        // Account for gen 1 Special stat
        switch (generation) {
            case 1:
                statsString += `Spc: **${pokemon.baseStats.spa}** ${SpAstats}\n`;
                break;
            default:
                statsString += `SpA: **${pokemon.baseStats.spa}** ${SpAstats}\nSpD: **${pokemon.baseStats.spd}** ${SpDstats}\n`;
                break;
        };
        statsString += `Spe: **${pokemon.baseStats.spe}** ${Spestats}\nBST: ${pokemon.bst}`;

        let levelMoves = [];
        let levelMovesNames = [];
        let tmMoves = [];
        let eggMoves = [];
        let tutorMoves = [];
        let specialMoves = [];
        let transferMoves = [];
        let reminderMoves = [];
        let prevo = null;
        if (pokemon.prevo) prevo = dexModified.species.get(pokemon.prevo);
        if (prevo && prevo.prevo) prevo = dexModified.species.get(prevo.prevo);
        let pokemonLearnset = learnsets[pokemon.id];
        if (learnsetBool && pokemonLearnset) {
            pokemonLearnset = await checkBaseSpeciesMoves(Dex, learnsets, pokemon);
            for (let [moveName, learnData] of Object.entries(pokemonLearnset)) {
                moveName = dexModified.moves.get(moveName).name;
                for (let moveLearnData of learnData) {
                    let moveLearnGen = moveLearnData[0];
                    if (moveLearnGen > generation) {
                        continue;
                    } else if (moveLearnGen < generation && generation < 8) { // Transfer moves are deprecated in gen 8
                        transferMoves.push(moveName);
                        continue;
                    } else if (moveLearnGen < generation) {
                        continue;
                    } else if (moveLearnData.includes("L")) { // Levelup moves can be repeated
                        levelMoves[moveName] = parseInt(moveLearnData.split("L")[1]);
                        levelMovesNames.push(moveName);
                    } else if (moveLearnData.includes("M") && !tmMoves.includes(moveName)) {
                        tmMoves.push(moveName);
                    } else if (moveLearnData.includes("E") && !eggMoves.includes(moveName) && generation >= 2) { // Breeding is gen 2+, check might be redundant
                        eggMoves.push(moveName);
                    } else if (moveLearnData.includes("T") && !tutorMoves.includes(moveName)) {
                        tutorMoves.push(moveName);
                    } else if (moveLearnData.includes("S") && !specialMoves.includes(moveName)) {
                        specialMoves.push(moveName);
                    } else if (moveLearnData.includes("R") && !reminderMoves.includes(moveName)) {
                        reminderMoves.push(moveName);
                    };
                };
            };
            levelMoves = await Object.entries(levelMoves).sort((a, b) => a[1] - b[1]);
            // Prevo egg moves
            if (prevo) {
                for (let [moveName, learnData] of Object.entries(learnsets[prevo.id].learnset)) {
                    moveName = dexModified.moves.get(moveName).name;
                    for (let moveLearnData of learnData) {
                        if (moveLearnData.startsWith("9E")) {
                            eggMoves.push(moveName);
                        };
                    };
                };
            };
        };
        let levelMovesString = "";
        for (let reminderMove in Object.entries(reminderMoves)) levelMovesString += `0: ${reminderMoves[reminderMove]}\n`;
        for (let levelMove in Object.entries(levelMoves)) levelMovesString += `${levelMoves[levelMove][1]}: ${levelMoves[levelMove][0]}\n`;
        let tmMovesStrings = [];
        let tmMoveIndex = 0;
        for (const tmMove of tmMoves) {
            if (!tmMovesStrings[tmMoveIndex]) tmMovesStrings[tmMoveIndex] = [];
            tmMovesStrings[tmMoveIndex].push(tmMove);
            if (tmMovesStrings[tmMoveIndex].join(", ").length > 1000) tmMoveIndex += 1; // 1000 instead of 1024 to add an extra entry for the overflow
        };
        let eggMovesString = eggMoves.join(", ");
        let tutorMovesString = tutorMoves.join(", ");
        specialMoves = [...new Set(specialMoves)].filter((el) => !levelMovesNames.includes(el)).filter((el) => !tmMoves.includes(el)).filter((el) => !eggMoves.includes(el)).filter((el) => !tutorMoves.includes(el));
        let specialMovesString = specialMoves.join(", ");
        let transferMovesStrings = [];
        let transferMoveIndex = 0;
        transferMoves = [...new Set(transferMoves)].filter((el) => !levelMovesNames.includes(el)).filter((el) => !tmMoves.includes(el)).filter((el) => !eggMoves.includes(el)).filter((el) => !tutorMoves.includes(el)).filter((el) => !specialMoves.includes(el));
        for (const transferMove of transferMoves) {
            if (!transferMovesStrings[transferMoveIndex]) transferMovesStrings[transferMoveIndex] = [];
            transferMovesStrings[transferMoveIndex].push(transferMove);
            if (transferMovesStrings[transferMoveIndex].join(", ").length > 1000) transferMoveIndex += 1;
        };
        let embedColor = client.globalVars.embedColor;
        if (pokemon.color) {
            if (colorHexes[pokemon.color.toLowerCase()]) embedColor = colorHexes[pokemon.color.toLowerCase()];
        };
        // Construct footer
        let footerText = ``;
        let pokemonAvailability = pokemon.isNonstandard;
        switch (pokemonAvailability) {
            case null:
                footerText = `Available in generation ${generation}`;
                break;
            case "Past":
                footerText = `Unavailable in generation ${generation}`;
                break;
            case "Future":
                footerText = `Does not exist yet in generation ${generation}`;
                break;
        };
        // Get relative Pokédex variables
        let previousPokemon = null;
        let nextPokemon = null;
        let allPokemon = dexModified.species.all();
        let buttonAppend = `${learnsetBool}|${shinyBool}|${generation}`;
        let allPokemonSorted = [...allPokemon].sort(compare); // Needs a copy of allPokemon because sort() is destructive
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
        let pkmButtons = new Discord.ActionRowBuilder();
        let pkmButtons2 = new Discord.ActionRowBuilder();
        if (previousPokemon) pkmButtons.addComponents(new Discord.ButtonBuilder({ customId: `pkmleft|${buttonAppend}`, style: Discord.ButtonStyle.Primary, emoji: '⬅️', label: previousPokemon.name }));

        if (pokemon.name !== pokemon.baseSpecies) pkmButtons.addComponents(new Discord.ButtonBuilder({ customId: `pkmbase|${buttonAppend}`, style: Discord.ButtonStyle.Primary, emoji: '⬇️', label: pokemon.baseSpecies }));
        if (nextPokemon) pkmButtons.addComponents(new Discord.ButtonBuilder({ customId: `pkmright|${buttonAppend}`, style: Discord.ButtonStyle.Primary, emoji: '➡️', label: nextPokemon.name }));
        if (pokemon.prevo) {
            let prevoData = dexModified.species.get(pokemon.prevo);
            let evoMethod = getEvoMethod(pokemon);
            description = `\nEvolves from ${pokemon.prevo}${pokemonGender}${evoMethod}.`; // Technically uses current Pokémon guaranteed gender and not prevo gender, but since Pokémon can't change gender this works better in cases where only a specific gender of a non-genderlimited Pokémon can evolve
            if (["Future"].includes(prevoData.isNonstandard)) description += ` (Generation ${prevoData.gen}+)`;
            if (pokemon.prevo !== previousPokemon.name && pokemon.prevo !== nextPokemon.name) pkmButtons.addComponents(new Discord.ButtonBuilder({ customId: `pkmprevo|${buttonAppend}`, style: Discord.ButtonStyle.Primary, emoji: '⏬', label: pokemon.prevo }));
        };
        for (let i = 0; i < pokemon.evos.length; i++) {
            let pokemonData = dexModified.species.get(pokemon.evos[i]);
            let evoMethod = getEvoMethod(pokemonData);
            description += `\nEvolves into ${pokemon.evos[i]}${evoMethod}.`;
            if (["Future"].includes(pokemonData.isNonstandard)) description += ` (Generation ${pokemonData.gen}+)`;
            if (pokemon.evos[i] !== previousPokemon.name && pokemon.evos[i] !== nextPokemon.name) {
                if (pkmButtons.components.length < 5) {
                    pkmButtons.addComponents(new Discord.ButtonBuilder({ customId: `pkmevo${i + 1}|${buttonAppend}`, style: Discord.ButtonStyle.Primary, emoji: '⏫', label: pokemon.evos[i] }));
                } else {
                    // This exists solely because of Eevee
                    pkmButtons2.addComponents(new Discord.ButtonBuilder({ customId: `pkmevo${i + 1}|${buttonAppend}`, style: Discord.ButtonStyle.Primary, emoji: '⏫', label: pokemon.evos[i] }));
                };
            };
        };
        let formButtonsComponentsCounter = 0;
        let formButtonsObject = {
            0: new Discord.ActionRowBuilder(),
            1: new Discord.ActionRowBuilder(),
            2: new Discord.ActionRowBuilder(),
            3: new Discord.ActionRowBuilder(),
            4: new Discord.ActionRowBuilder()
        };
        let pokemonForms = [];
        if (pokemon.otherFormes && pokemon.otherFormes.length > 0) pokemonForms = [...pokemon.otherFormes]; // Needs to be a copy. Not sure why since no changes are being applied to pokemon.otherFormes. Whatever.
        if (pokemon.canGigantamax) pokemonForms.push(`${pokemon.name}-Gmax`);
        if (pokemonForms && pokemonForms.length > 0) {
            if (pokemonForms.length > 0) {
                for (let i = 0; i < pokemonForms.length; i++) {
                    if (formButtonsObject[formButtonsComponentsCounter].components.length > 4) formButtonsComponentsCounter++;
                    formButtonsObject[formButtonsComponentsCounter].addComponents(new Discord.ButtonBuilder({ customId: `pkmForm${i}|${buttonAppend}`, style: Discord.ButtonStyle.Secondary, label: pokemonForms[i] }));
                };
            };
        };
        let buttonArray = [];
        if (formButtonsObject[0].components.length > 0) buttonArray.push(formButtonsObject[0]);
        if (formButtonsObject[1].components.length > 0) buttonArray.push(formButtonsObject[1]);
        if (formButtonsObject[2].components.length > 0) buttonArray.push(formButtonsObject[2]);
        if (formButtonsObject[3].components.length > 0 && pkmButtons2.components.length < 1) buttonArray.push(formButtonsObject[3]);
        buttonArray.push(pkmButtons);
        if (pkmButtons2.components.length > 0) buttonArray.push(pkmButtons2);
        // Embed building
        const pkmEmbed = new Discord.EmbedBuilder()
            .setColor(embedColor)
            .setAuthor({ name: `${pokemonID.toUpperCase()}: ${pokemon.name}`, iconURL: iconAuthor })
            .setThumbnail(iconThumbnail);
        if (description.length > 0) pkmEmbed.setDescription(description);
        pkmEmbed.addFields([
            { name: "Type:", value: typeString, inline: true },
            { name: "Metrics:", value: metricsString, inline: true }
        ]);
        if (generation >= 2) pkmEmbed.addFields([{ name: "Gender:", value: genderString, inline: true }]); // Genders are gen 2+
        if (generation >= 3) pkmEmbed.addFields([{ name: "Abilities:", value: abilityString, inline: false }]); // Abilities are gen 3+
        if (superEffectives.length > 0) pkmEmbed.addFields([{ name: "Weaknesses:", value: superEffectives, inline: false }]);
        if (resistances.length > 0) pkmEmbed.addFields([{ name: "Resistances:", value: resistances, inline: false }]);
        if (immunities.length > 0) pkmEmbed.addFields([{ name: "Immunities:", value: immunities, inline: false }]);
        pkmEmbed
            .addFields([
                { name: `Stats: ${statLevels}`, value: statsString, inline: false }
            ]);
        // .setImage(banner)
        if (learnsetBool) {
            if (levelMovesString.length > 0) pkmEmbed.addFields([{ name: "Levelup Moves:", value: levelMovesString, inline: false }]);
            tmMovesStrings.forEach(tmMovesString => pkmEmbed.addFields([{ name: "TM Moves:", value: tmMovesString.join(", "), inline: false }]));
            if (eggMovesString.length > 0) pkmEmbed.addFields([{ name: "Egg Moves:", value: eggMovesString, inline: false }]);
            if (tutorMovesString.length > 0) pkmEmbed.addFields([{ name: "Tutor Moves:", value: tutorMovesString, inline: false }]);
            if (specialMovesString.length > 0) pkmEmbed.addFields([{ name: "Special Moves:", value: specialMovesString, inline: false }]);
            if (generation < 8 && transferMovesStrings.length > 0) transferMovesStrings.forEach(transferMovesString => pkmEmbed.addFields([{ name: "Transfer Moves:", value: transferMovesString.join(", "), inline: false }]));
        };
        pkmEmbed.setFooter({ text: footerText, iconURL: iconFooter });
        let messageObject = { embeds: pkmEmbed, components: buttonArray };
        return messageObject;

        function calcHP(base, generation) {
            let min50;
            let max50;
            let min100;
            let max100;
            if (generation <= 2) {
                min50 = Math.floor(((((base) * 2) * 50) / 100) + 50 + 10);
                max50 = Math.floor((((((base + 15) * 2) + Math.sqrt(65535) / 4) * 50) / 100) + 50 + 10);
                min100 = Math.floor(((((base) * 2) * 100) / 100) + 100 + 10);
                max100 = Math.floor((((((base + 15) * 2) + Math.sqrt(65535) / 4) * 100) / 100) + 100 + 10);
            } else if (generation >= 3) {
                min50 = Math.floor((((2 * base) * 50) / 100) + 50 + 10);
                max50 = Math.floor((((2 * base + 31 + (252 / 4)) * 50) / 100) + 50 + 10);
                min100 = Math.floor((((2 * base) * 100) / 100) + 100 + 10);
                max100 = Math.floor((((2 * base + 31 + (252 / 4)) * 100) / 100) + 100 + 10);
            };
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
        function calcStat(base, generation) {
            let min50;
            let max50;
            let min100;
            let max100;
            if (generation <= 2) {
                min50 = Math.floor(((((base) * 2) * 50) / 100) + 5);
                max50 = Math.floor((((((base + 15) * 2) + Math.sqrt(65535) / 4) * 50) / 100) + 5);
                min100 = Math.floor(((((base) * 2) * 100) / 100) + 5);
                max100 = Math.floor((((((base + 15) * 2) + Math.sqrt(65535) / 4) * 100) / 100) + 5);
            } else if (generation >= 3) {
                //// Gen 3+
                min50 = Math.floor(((((2 * base) * 50) / 100) + 5) * 0.9);
                max50 = Math.floor(((((2 * base + 31 + (252 / 4)) * 50) / 100) + 5) * 1.1);
                min100 = Math.floor(((((2 * base) * 100) / 100) + 5) * 0.9);
                max100 = Math.floor(((((2 * base + 31 + (252 / 4)) * 100) / 100) + 5) * 1.1);
            };
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