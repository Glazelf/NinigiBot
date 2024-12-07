import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    bold
} from "discord.js";
import { Dex } from '@pkmn/dex';
import { Dex as DexSim } from '@pkmn/sim';
import urlExists from "../urlExists.js";
import convertMeterFeet from "../math/convertMeterFeet.js";
import leadingZeros from "../leadingZeros.js";
import getCleanPokemonID from "./getCleanPokemonID.js";
import getTypeEmojis from "./getTypeEmojis.js";
import checkBaseSpeciesMoves from "./checkBaseSpeciesMoves.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import colorHexes from "../../objects/colorHexes.json" with { type: "json" };

const allPokemon = Dex.species.all().filter(pokemon => pokemon.exists && pokemon.num > 0 && pokemon.isNonstandard !== "CAP");

export default async ({ pokemon, learnsetBool = false, shinyBool = false, genData, emojis }) => {
    let messageObject;
    const pkmEmbed = new EmbedBuilder();
    let generation = genData.dex.gen;
    let allPokemonGen = Array.from(genData.species).filter(pokemon => pokemon.exists && pokemon.num > 0 && !["CAP", "Future"].includes(pokemon.isNonstandard));
    let pokemonLearnset = await genData.learnsets.get(pokemon.name);
    pokemonLearnset = await checkBaseSpeciesMoves(pokemon, pokemonLearnset);
    let pokemonGen = genData.species.get(pokemon.name);
    if (generation < pokemon.gen) {
        pkmEmbed
            .setTitle(`Error`)
            .setDescription(`\`${pokemon.name}\` does not exist yet in generation ${generation}.\n\`${pokemon.name}\` was introduced in generation ${pokemon.gen}.`);
        messageObject = { embeds: pkmEmbed, components: [], ephemeral: true };
        return messageObject;
    };
    // Common settings
    if (!pokemon) return;
    let recentGame = "SV";
    let description = "";
    // Construct footer
    let footerText = `Unavailable in generation ${generation}`;
    let pokemonAvailable = (pokemonGen !== undefined);
    // For some reason gmax forms don't return generational data, so get an extra check here
    if (pokemonAvailable || (generation == 8 && pokemon.name.endsWith("-Gmax"))) footerText = `Available in generation ${generation}`;
    if (!pokemonGen) pokemonGen = pokemon;
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
            genderString = `${iconMale} ${pokemonGen.genderRatio.M * 100}%\n${iconFemale} ${pokemonGen.genderRatio.F * 100}%`;
            break;
    };
    // Typing
    let type1 = pokemonGen.types[0];
    let type2 = pokemonGen.types[1];
    let typeString = `${getTypeEmojis({ type: type1, emojis: emojis })}`;
    if (type2) typeString += `\n${getTypeEmojis({ type: type2, emojis: emojis })}`;
    // Check type matchups
    let superEffectives = [];
    let resistances = [];
    let immunities = [];
    for (let type of genData.types) {
        if (["???", "Stellar"].includes(type.name)) continue;
        let effectiveness = genData.types.totalEffectiveness(type.name, pokemonGen.types);
        let typeEmoteBold = false;
        if ([0.25, 4].includes(effectiveness)) typeEmoteBold = true;
        let typeEffectString = getTypeEmojis({ type: type.name, boldBool: typeEmoteBold, emojis: emojis });
        if ([2, 4].includes(effectiveness)) superEffectives.push(typeEffectString);
        if ([0.25, 0.5].includes(effectiveness)) resistances.push(typeEffectString);
        if (effectiveness == 0) immunities.push(typeEffectString);
    };
    let superEffectivesString = superEffectives.join(", ");
    let resistancesString = resistances.join(", ");
    let immunitiesString = immunities.join(", ");

    let pokemonID = getCleanPokemonID(pokemonGen);
    let pokemonIDPMD = leadingZeros(pokemonID, 4); // Remove this when Showdown and Serebii switch to 4 digit IDs consistently as well
    // Metrics
    let metricsString = "";
    let weightAmerican = Math.round(pokemon.weightkg * 2.20462 * 10) / 10;
    let pokemonSim = DexSim.forGen(genData.dex.gen).species.get(pokemon.name);
    let heightAmerican = convertMeterFeet(pokemonSim.heightm);
    if (pokemonGen.weightkg && pokemonGen.weightkg > 0) {
        metricsString += `${bold("Weight:")}\n${pokemonGen.weightkg}kg | ${weightAmerican}lbs`;
    } else {
        metricsString += `${bold("Weight:")}\n???`;
    };
    if (pokemonSim.heightm) metricsString += `\n${bold("Height:")}\n${pokemonSim.heightm}m | ${heightAmerican}ft`;
    // let urlName = encodeURIComponent(pokemon.name.toLowerCase().replace(" ", "-")); // Use normalizeString() if I ever uncomment this
    // Official art
    let render = `https://www.serebii.net/pokemon/art/${pokemonID}.png`;
    // Game render
    // let renderGame = `https://www.serebii.net/swordshield/pokemon/${pokemonID}.png`;
    // Shiny
    // PMD portraits
    let PMDPortrait = `https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/portrait/${pokemonIDPMD}/Normal.png`;
    let PMDPortraitExists = urlExists(PMDPortrait);
    // Small party icons
    let partyIcon = `https://www.serebii.net/pokedex-${recentGame.toLowerCase()}/icon/${pokemonID}.png`;
    // Shiny render
    let shinyRender = `https://www.serebii.net/Shiny/${recentGame}/${pokemonID}.png`;
    // let shinyRender = `https://play.pokemonshowdown.com/sprites/dex-shiny/${urlName}.png`; // Smaller, low-res render
    // April Fools Day sprites
    let afdSprite = `https://play.pokemonshowdown.com/sprites/afd/${pokemon.spriteid}.png`;
    if (shinyBool) afdSprite = afdSprite.replace("/afd/", "/afd-shiny/");

    // let banner = render;
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
    let abilityString = "";
    if (pokemonGen.abilities['0']) {
        let ability0Desc = genData.abilities.get(pokemonGen.abilities[0]).shortDesc;
        abilityString += `${bold(pokemonGen.abilities['0'])}: ${ability0Desc}`;
    };
    if (pokemonGen.abilities['1']) {
        let ability1Desc = genData.abilities.get(pokemonGen.abilities[1]).shortDesc;
        abilityString += `\n${bold(pokemon.abilities['1'])}: ${ability1Desc}`;
    };
    if (pokemonGen.abilities['H']) {
        let abilityHDesc = genData.abilities.get(pokemonGen.abilities['H']).shortDesc;
        if (pokemonGen.unreleasedHidden) {
            abilityString += `\n${bold(pokemonGen.abilities['H'])} (Unreleased Hidden): ${abilityHDesc}`;
        } else {
            abilityString += `\n${bold(pokemonGen.abilities['H'])} (Hidden): ${abilityHDesc}`;
        };
    };
    if (pokemonGen.abilities['S']) {
        let abilitySDesc = genData.abilities.get(pokemonGen.abilities['S']).shortDesc;
        abilityString += `\n${bold(pokemonGen.abilities['S'])} (Special): ${abilitySDesc}`;
    };
    let statLevels = `(lvl50) (lvl100)`;
    let HPstats = calcHP(pokemonGen, generation);
    let Atkstats = calcStat(pokemonGen.baseStats.atk, generation);
    let Defstats = calcStat(pokemonGen.baseStats.def, generation);
    let SpAstats = calcStat(pokemonGen.baseStats.spa, generation);
    let SpDstats = calcStat(pokemonGen.baseStats.spd, generation);
    let Spestats = calcStat(pokemonGen.baseStats.spe, generation);
    let statsString = `${Dex.stats.shortNames.hp}: ${bold(pokemonGen.baseStats.hp)} ${HPstats}\n${Dex.stats.shortNames.atk}: ${bold(pokemonGen.baseStats.atk)} ${Atkstats}\n${Dex.stats.shortNames.def}: ${bold(pokemonGen.baseStats.def)} ${Defstats}\n`;
    // Account for gen 1 Special stat
    switch (generation) {
        case 1:
            statsString += `${genData.stats.dex.stats.shortNames.spa}: ${bold(pokemonGen.baseStats.spa)} ${SpAstats}\n`;
            break;
        default:
            statsString += `${Dex.stats.shortNames.spa}: ${bold(pokemonGen.baseStats.spa)} ${SpAstats}\n${Dex.stats.shortNames.spd}: ${bold(pokemonGen.baseStats.spd)} ${SpDstats}\n`;
            break;
    };
    statsString += `${Dex.stats.shortNames.spe}: ${bold(pokemonGen.baseStats.spe)} ${Spestats}\nBST: ${pokemonGen.bst}`;

    let levelMoves = [];
    let levelMovesNames = [];
    let tmMoves = [];
    let tmMovesStrings = [];
    let eggMoves = [];
    let tutorMoves = [];
    let specialMoves = [];
    let transferMoves = [];
    let transferMovesStrings = [];
    let reminderMoves = [];
    let vcMoves = [];
    let levelMovesString = "";
    let eggMovesString = "";
    let tutorMovesString = "";
    let specialMovesString = "";
    let prevoDataMoves = Dex.species.get(pokemon.prevo);
    if (prevoDataMoves && prevoDataMoves.prevo) prevoDataMoves = Dex.species.get(prevoDataMoves.prevo);
    if (learnsetBool && pokemonLearnset && pokemonAvailable) {
        for (let [moveName, learnData] of Object.entries(pokemonLearnset.learnset)) {
            let moveData = genData.moves.get(moveName);
            if (moveData) moveName = moveData.name;
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
                } else if (moveLearnData.includes("V") && !vcMoves.includes(moveName)) {
                    vcMoves.push(moveName);
                };
            };
        };
        levelMoves = Object.entries(levelMoves).sort((a, b) => a[1] - b[1]);
        // Prevo egg moves
        if (prevoDataMoves && prevoDataMoves.name) {
            let pokemonPrevoLearnset = await genData.learnsets.get(prevoDataMoves.name);
            if (pokemonPrevoLearnset && pokemonPrevoLearnset.learnset) {
                for (let [moveName, learnData] of Object.entries(pokemonPrevoLearnset.learnset)) {
                    let moveData = genData.moves.get(moveName);
                    if (moveData) moveName = moveData.name;
                    for (let moveLearnData of learnData) {
                        if (moveLearnData.startsWith(`${generation}E`)) eggMoves.push(moveName);
                    };
                };
            };
        };

        for (let reminderMove in Object.entries(reminderMoves)) levelMovesString += `0: ${reminderMoves[reminderMove]}\n`;
        for (let levelMove in Object.entries(levelMoves)) levelMovesString += `${levelMoves[levelMove][1]}: ${levelMoves[levelMove][0]}\n`;
        let tmMoveIndex = 0;
        let transferMoveIndex = 0;
        for (const tmMove of tmMoves) {
            if (!tmMovesStrings[tmMoveIndex]) tmMovesStrings[tmMoveIndex] = [];
            tmMovesStrings[tmMoveIndex].push(tmMove);
            if (tmMovesStrings[tmMoveIndex].join(", ").length > 1000) tmMoveIndex += 1; // 1000 instead of 1024 to add an extra entry for the overflow
        };
        eggMovesString = eggMoves.join(", ");
        tutorMovesString = tutorMoves.join(", ");
        specialMoves = [...new Set(specialMoves)].filter((el) => !levelMovesNames.includes(el)).filter((el) => !tmMoves.includes(el)).filter((el) => !eggMoves.includes(el)).filter((el) => !tutorMoves.includes(el));
        specialMovesString = specialMoves.join(", ");
        transferMoves = [...new Set(transferMoves)].filter((el) => !levelMovesNames.includes(el)).filter((el) => !tmMoves.includes(el)).filter((el) => !eggMoves.includes(el)).filter((el) => !tutorMoves.includes(el)).filter((el) => !specialMoves.includes(el));
        for (const transferMove of transferMoves) {
            if (!transferMovesStrings[transferMoveIndex]) transferMovesStrings[transferMoveIndex] = [];
            transferMovesStrings[transferMoveIndex].push(transferMove);
            if (transferMovesStrings[transferMoveIndex].join(", ").length > 1000) transferMoveIndex += 1;
        };
    };
    // Get relative Pokédex variables
    let previousPokemon = null;
    let nextPokemon = null;
    let buttonAppend = `${learnsetBool}|${shinyBool}|${generation}`;
    let maxPkmID = allPokemonGen[allPokemonGen.length - 1].num;
    let previousPokemonID = pokemon.num - 1;
    let nextPokemonID = pokemon.num + 1;
    if (previousPokemonID < 1) previousPokemonID = maxPkmID;
    if (nextPokemonID > maxPkmID) nextPokemonID = 1;
    previousPokemon = allPokemon.filter(pokemon => pokemon.num == previousPokemonID)[0];
    nextPokemon = allPokemon.filter(pokemon => pokemon.num == nextPokemonID)[0];
    // Add species buttons
    let pkmButtons = new ActionRowBuilder();
    let pkmButtons2 = new ActionRowBuilder();
    const previousPokemonButton = new ButtonBuilder()
        .setCustomId(`pkmleft|${buttonAppend}`)
        .setLabel(previousPokemon.name)
        .setStyle(ButtonStyle.Primary)
        .setEmoji('⬅️');
    pkmButtons.addComponents(previousPokemonButton);
    const nextPokemonButton = new ButtonBuilder({ customId: `pkmright|${buttonAppend}`, style: ButtonStyle.Primary, emoji: '➡️', label: nextPokemon.name })
        .setCustomId(`pkmright|${buttonAppend}`)
        .setLabel(nextPokemon.name)
        .setStyle(ButtonStyle.Primary)
        .setEmoji('➡️');
    pkmButtons.addComponents(nextPokemonButton);
    if (pokemon.name !== pokemon.baseSpecies) {
        const baseSpeciesButton = new ButtonBuilder()
            .setCustomId(`pkmbase|${buttonAppend}`)
            .setLabel(pokemon.baseSpecies)
            .setStyle(ButtonStyle.Primary)
            .setEmoji('⬇️');
        pkmButtons.addComponents(baseSpeciesButton);
    };
    if (pokemon.prevo) {
        let prevoDataEvo = Dex.species.get(pokemon.prevo); // Second prevoData is required, initial one can be overwritten by prevo of prevo
        let evoMethod = getEvoMethod(pokemon);
        if (prevoDataEvo.gen <= generation) {
            if (pokemon.gender == prevoDataEvo.gender) pokemonGender = "";
            description = `\nEvolves from ${pokemon.prevo}${pokemonGender}${evoMethod}.`; // Technically uses current Pokémon guaranteed gender and not prevo gender, but since Pokémon can't change gender this works better in cases where only a specific gender of a non-genderlimited Pokémon can evolve
            if (![previousPokemon.name, nextPokemon.name].includes(pokemon.prevo)) {
                const prevoButton = new ButtonBuilder()
                    .setCustomId(`pkmprevo|${buttonAppend}`)
                    .setLabel(pokemon.prevo)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('⏬');
                pkmButtons.addComponents(prevoButton);
            };
        };
    };
    let pokemonEvos = pokemon.evos || [];
    for (let i = 0; i < pokemonEvos.length; i++) {
        let pokemonEvoData = Dex.species.get(pokemon.evos[i]);
        let evoMethod = getEvoMethod(pokemonEvoData);
        let evoGender = "";
        if (pokemon.gender !== pokemonEvoData.gender) {
            switch (pokemonEvoData.gender) {
                case "M":
                    evoGender = iconMale;
                    break;
                case "F":
                    evoGender = iconFemale;
                    break;
            };
        };
        description += `\nEvolves into ${pokemon.evos[i]}${evoGender}${evoMethod}.`;
        if (![previousPokemon.name, nextPokemon.name].includes(pokemon.evos[i]) && pokemonEvoData.gen <= generation) {
            const evoButton = new ButtonBuilder()
                .setCustomId(`pkmevo${i + 1}|${buttonAppend}`)
                .setLabel(pokemon.evos[i])
                .setStyle(ButtonStyle.Primary)
                .setEmoji('⏫');
            if (pkmButtons.components.length < 5) {
                pkmButtons.addComponents(evoButton);
            } else {
                // This exists solely because of Eevee
                pkmButtons2.addComponents(evoButton);
            };
        };
    };
    let formButtonsComponentsCounter = 0;
    let formButtonsObject = {
        0: new ActionRowBuilder(),
        1: new ActionRowBuilder(),
        2: new ActionRowBuilder(),
        3: new ActionRowBuilder(),
        4: new ActionRowBuilder()
    };
    let pokemonForms = [];
    if (pokemon.otherFormes && pokemon.otherFormes.length > 0) pokemonForms = [...pokemon.otherFormes]; // Needs to be a copy. Not sure why since no changes are being applied to pokemon.otherFormes. Changing this causes a bug where buttons are sometimes duplicated after clicking buttons.
    if (pokemon.canGigantamax) pokemonForms.push(`${pokemon.name}-Gmax`);
    if (pokemonForms && pokemonForms.length > 0) {
        if (pokemonForms.length > 0) {
            for (let i = 0; i < pokemonForms.length; i++) {
                let formData = Dex.species.get(pokemonForms[i]);
                if (formData.gen > generation) continue;
                if (formButtonsObject[formButtonsComponentsCounter].components.length > 4) formButtonsComponentsCounter++;
                const formButton = new ButtonBuilder()
                    .setCustomId(`pkmForm${i}|${buttonAppend}`)
                    .setLabel(pokemonForms[i])
                    .setStyle(ButtonStyle.Secondary);
                formButtonsObject[formButtonsComponentsCounter].addComponents(formButton);
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
    pkmEmbed
        .setAuthor({ name: `${pokemonID.toUpperCase()}: ${pokemon.name}`, iconURL: iconAuthor })
        .setThumbnail(iconThumbnail);
    if (description.length > 0) pkmEmbed.setDescription(description);
    pkmEmbed.addFields([
        { name: "Type:", value: typeString, inline: true },
        { name: "Metrics:", value: metricsString, inline: true }
    ]);
    if (generation >= 2) pkmEmbed.addFields([{ name: "Gender:", value: genderString, inline: true }]); // Genders are gen 2+
    if (generation >= 3) pkmEmbed.addFields([{ name: "Abilities:", value: abilityString, inline: false }]); // Abilities are gen 3+
    if (superEffectivesString.length > 0) pkmEmbed.addFields([{ name: "Weaknesses:", value: superEffectivesString, inline: false }]);
    if (resistancesString.length > 0) pkmEmbed.addFields([{ name: "Resistances:", value: resistancesString, inline: false }]);
    if (immunitiesString.length > 0) pkmEmbed.addFields([{ name: "Immunities:", value: immunitiesString, inline: false }]);
    pkmEmbed.addFields([{ name: `Stats: ${statLevels}`, value: statsString, inline: false }]);
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
    // Embed color, mostly for buttons
    let embedColor = globalVars.embedColor;
    if (pokemonSim.color) embedColor = colorHexes[pokemonSim.color.toLowerCase()];
    pkmEmbed.setColor(embedColor);
    messageObject = { embeds: [pkmEmbed], components: buttonArray };
    return messageObject;
};

function calcHP(pokemon, generation) {
    let base = pokemon.baseStats.hp;
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