module.exports = async ({ client, interaction, pokemon, learnsetBool = false, shinyBool = false, ephemeral = true }) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../sendMessage');
        const Discord = require("discord.js");
        const { Dex } = require('pokemon-showdown');
        const imageExists = require('../imageExists');
        const isAdmin = require('../isAdmin');
        const convertMeterFeet = require('../convertMeterFeet');
        const correctionID = require('../../objects/pokemon/correctionID.json');
        const colorHexes = require('../../objects/colorHexes.json');
        const typechart = require('../../node_modules/pokemon-showdown/dist/data/typechart.js').TypeChart;
        const learnsets = require('../../node_modules/pokemon-showdown/dist/data/learnsets.js').Learnsets;
        const getTypeEmotes = require('./getTypeEmotes');
        const checkBaseSpeciesMoves = require('./checkBaseSpeciesMoves.js');
        // Common settings
        if (!pokemon) return;
        let adminBot = isAdmin(client, interaction.guild.members.me);
        let emotesAllowed = true;
        if (ephemeral == true && !interaction.guild.members.me.permissions.has(Discord.PermissionFlagsBits.UseExternalEmojis) && !adminBot) emotesAllowed = false;
        let recentGame = "SV";
        let description = "";
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
        // Check type matchups, maybe use Dex.types sometime
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

        var pokemonID = leadingZeros(pokemon.num.toString()); // Do a rewrite sometime to avoid using var
        // Forms
        const primalString = "-Primal";
        const totemString = "-Totem";
        const gmaxString = "-Gmax";
        const eternamaxString = "-Eternamax";
        const primalBool = pokemon.name.endsWith(primalString);
        const totemBool = pokemon.name.endsWith(totemString);
        const gmaxBool = pokemon.name.endsWith(gmaxString);
        const eternamaxBool = pokemon.name.endsWith(eternamaxString);
        const dynamaxBool = Boolean(gmaxBool || eternamaxBool);
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
        if (pokemon.name.startsWith("Arceus-") || pokemon.name.startsWith("Silvally-")) pokemonID = `${pokemonID.split("-")[0]}-${pokemon.types[0].toLowerCase()}`;
        // 3 digit IDs for now
        pokemonIDPMD = pokemonID;
        if (pokemonID[0] == "0") pokemonID = pokemonID.substring(1); // Remove this when Showdown and Serebii switch to 4 digit IDs consistently
        // Metrics
        let metricsString = "";
        let weightAmerican = Math.round(pokemon.weightkg * 2.20462 * 10) / 10;
        let heightAmerican = convertMeterFeet(pokemon.heightm);
        if (pokemon.weightkg) {
            metricsString += `**Weight:**\n${pokemon.weightkg}kg | ${weightAmerican}lbs`;
        } else if (dynamaxBool) {
            metricsString += `**Weight:**\n???`;
        };
        if (pokemon.heightm) {
            metricsString += `\n**Height:**\n${pokemon.heightm}m | ${heightAmerican}ft`;
            if (dynamaxBool) metricsString = metricsString.replace("m", "m+").replace("ft", "ft+");
        };
        let urlName = encodeURIComponent(pokemon.name.toLowerCase().replace(" ", "-"));
        // Official art
        let render = `https://www.serebii.net/pokemon/art/${pokemonID}.png`;
        // Game render
        let renderGame = `https://www.serebii.net/swordshield/pokemon/${pokemonID}.png`;
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
        let statLevels = `(lvl50) (lvl100)`;
        let HPstats = calcHP(pokemon.baseStats.hp);
        let Atkstats = calcStat(pokemon.baseStats.atk);
        let Defstats = calcStat(pokemon.baseStats.def);
        let SpAstats = calcStat(pokemon.baseStats.spa);
        let SpDstats = calcStat(pokemon.baseStats.spd);
        let Spestats = calcStat(pokemon.baseStats.spe);

        let levelMoves = [];
        let levelMovesNames = [];
        let tmMoves = [];
        let eggMoves = [];
        let tutorMoves = [];
        let specialMoves = [];
        let transferMoves = [];
        let reminderMoves = [];
        let prevo = null;
        if (pokemon.prevo) prevo = Dex.species.get(pokemon.prevo);
        if (prevo && prevo.prevo) prevo = Dex.species.get(prevo.prevo);
        let pokemonLearnset = learnsets[pokemon.id];
        if (learnsetBool && pokemonLearnset) {
            pokemonLearnset = await checkBaseSpeciesMoves(Dex, learnsets, pokemon);
            for (let [moveName, learnData] of Object.entries(pokemonLearnset)) {
                moveName = Dex.moves.get(moveName).name;
                for (let moveLearnData of learnData) {
                    if (!moveLearnData.startsWith("9")) {
                        transferMoves.push(moveName);
                        continue;
                    } else if (moveLearnData.includes("L")) {
                        levelMoves[moveName] = parseInt(moveLearnData.replace("9L", ""));
                        levelMovesNames.push(moveName);
                    } else if (moveLearnData.includes("M")) {
                        tmMoves.push(moveName);
                    } else if (moveLearnData.includes("E")) {
                        eggMoves.push(moveName);
                    } else if (moveLearnData.includes("T")) {
                        tutorMoves.push(moveName);
                    } else if (moveLearnData.includes("S")) {
                        specialMoves.push(moveName);
                    } else if (moveLearnData.includes("R")) {
                        reminderMoves.push(moveName);
                    };
                };
            };
            levelMoves = await Object.entries(levelMoves).sort((a, b) => a[1] - b[1]);
            // Prevo egg moves
            if (prevo) {
                for (let [moveName, learnData] of Object.entries(learnsets[prevo.id].learnset)) {
                    moveName = Dex.moves.get(moveName).name;
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
        let embedColor = globalVars.embedColor;
        if (pokemon.color) {
            if (colorHexes[pokemon.color.toLowerCase()]) embedColor = colorHexes[pokemon.color.toLowerCase()];
        };
        let footerText = pokemon.isNonstandard;
        switch (footerText) {
            case null:
                footerText = `Available in ${recentGame}`;
                break;
            case "Past":
                footerText = `Unavailable in ${recentGame}`;
                break;
        };
        // Get relative Pokédex variables
        let previousPokemon = null;
        let nextPokemon = null;
        let allPokemon = Dex.species.all();
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
        if (previousPokemon) pkmButtons.addComponents(new Discord.ButtonBuilder({ customId: `pkmleft|${learnsetBool}|${shinyBool}`, style: Discord.ButtonStyle.Primary, emoji: '⬅️', label: previousPokemon.name }));

        if (pokemon.name !== pokemon.baseSpecies) pkmButtons.addComponents(new Discord.ButtonBuilder({ customId: `pkmbase|${learnsetBool}|${shinyBool}`, style: Discord.ButtonStyle.Primary, emoji: '⬇️', label: pokemon.baseSpecies }));
        if (nextPokemon) pkmButtons.addComponents(new Discord.ButtonBuilder({ customId: `pkmright|${learnsetBool}|${shinyBool}`, style: Discord.ButtonStyle.Primary, emoji: '➡️', label: nextPokemon.name }));
        if (pokemon.prevo) {
            let evoMethod = getEvoMethod(pokemon);
            description = `\nEvolves from ${pokemon.prevo}${pokemonGender}${evoMethod}.`; // Technically uses current Pokémon guaranteed gender and not prevo gender, but since Pokémon can't change gender this works better in cases where only a specific gender of a non-genderlimited Pokémon can evolve
            if (pokemon.prevo !== previousPokemon.name && pokemon.prevo !== nextPokemon.name) pkmButtons.addComponents(new Discord.ButtonBuilder({ customId: `pkmprevo|${learnsetBool}|${shinyBool}`, style: Discord.ButtonStyle.Primary, emoji: '⏬', label: pokemon.prevo }));
        };
        for (let i = 0; i < pokemon.evos.length; i++) {
            let pokemonData = Dex.species.get(pokemon.evos[i]);
            let evoMethod = getEvoMethod(pokemonData);
            description += `\nEvolves into ${pokemon.evos[i]}${evoMethod}.`;
            if (pokemon.evos[i] !== previousPokemon.name && pokemon.evos[i] !== nextPokemon.name) {
                if (pkmButtons.components.length < 5) {
                    pkmButtons.addComponents(new Discord.ButtonBuilder({ customId: `pkmevo${i + 1}|${learnsetBool}|${shinyBool}`, style: Discord.ButtonStyle.Primary, emoji: '⏫', label: pokemon.evos[i] }));
                } else {
                    // This exists solely because of Eevee
                    pkmButtons2.addComponents(new Discord.ButtonBuilder({ customId: `pkmevo${i + 1}|${learnsetBool}|${shinyBool}`, style: Discord.ButtonStyle.Primary, emoji: '⏫', label: pokemon.evos[i] }));
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
                    formButtonsObject[formButtonsComponentsCounter].addComponents(new Discord.ButtonBuilder({ customId: `pkmForm${i}|${learnsetBool}|${shinyBool}`, style: Discord.ButtonStyle.Secondary, label: pokemonForms[i] }));
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
            { name: "Metrics:", value: metricsString, inline: true },
            { name: "Gender:", value: genderString, inline: true },
            { name: "Abilities:", value: abilityString, inline: false }
        ]);
        if (superEffectives.length > 0) pkmEmbed.addFields([{ name: "Weaknesses:", value: superEffectives, inline: false }]);
        if (resistances.length > 0) pkmEmbed.addFields([{ name: "Resistances:", value: resistances, inline: false }]);
        if (immunities.length > 0) pkmEmbed.addFields([{ name: "Immunities:", value: immunities, inline: false }]);
        pkmEmbed
            .addFields([
                { name: `Stats: ${statLevels}`, value: `HP: **${pokemon.baseStats.hp}** ${HPstats}\nAtk: **${pokemon.baseStats.atk}** ${Atkstats}\nDef: **${pokemon.baseStats.def}** ${Defstats}\nSpA: **${pokemon.baseStats.spa}** ${SpAstats}\nSpD: **${pokemon.baseStats.spd}** ${SpDstats}\nSpe: **${pokemon.baseStats.spe}** ${Spestats}\nBST: ${pokemon.bst}`, inline: false }
            ]);
        // .setImage(banner)
        if (learnsetBool) {
            if (levelMovesString.length > 0) pkmEmbed.addFields([{ name: "Levelup Moves:", value: levelMovesString, inline: false }]);
            tmMovesStrings.forEach(tmMovesString => pkmEmbed.addFields([{ name: "TM Moves:", value: tmMovesString.join(", "), inline: false }]));
            if (eggMovesString.length > 0) pkmEmbed.addFields([{ name: "Egg Moves:", value: eggMovesString, inline: false }]);
            if (tutorMovesString.length > 0) pkmEmbed.addFields([{ name: "Tutor Moves:", value: tutorMovesString, inline: false }]);
            if (specialMovesString.length > 0) pkmEmbed.addFields([{ name: "Special Moves:", value: specialMovesString, inline: false }]);
            // Hide transfer moves untill transfer is added and it's confirmed movesets aren't reset on transfer
            // transferMovesStrings.forEach(transferMovesString => pkmEmbed.addFields([{ name: "Transfer Moves:", value: transferMovesString.join(", "), inline: false }]));
        };
        pkmEmbed
            .setFooter({ text: footerText, iconURL: iconFooter })
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
            for (let i = str.length; i < 4; i++) {
                str = "0" + str;
            };
            return str;
        };
        async function correctValue(object, pokemonName, input) {
            let uncorrectedNames = Object.keys(object);
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