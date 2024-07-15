import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBuilder,
    SlashCommandStringOption,
    SlashCommandIntegerOption,
    SlashCommandBooleanOption,
    SlashCommandSubcommandBuilder
} from "discord.js";
import axios from "axios";
import { Dex } from '@pkmn/dex';
import { Dex as DexSim } from '@pkmn/sim';
import { Generations } from '@pkmn/data';
import sendMessage from "../../util/sendMessage.js";
import areEmotesAllowed from "../../util/areEmotesAllowed.js";
import getPokemon from "../../util/pokemon/getPokemon.js";
import getWhosThatPokemon from "../../util/pokemon/getWhosThatPokemon.js";
import getTypeEmotes from "../../util/pokemon/getTypeEmotes.js";
import capitalizeString from "../../util/capitalizeString.js";
import leadingZeros from "../../util/leadingZeros.js";
import getRandomObjectItem from "../../util/getRandomObjectItem.js";
import checkBaseSpeciesMoves from "../../util/pokemon/checkBaseSpeciesMoves.js";
import urlExists from "../../util/urlExists.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import colorHexes from "../../objects/colorHexes.json" with { type: "json" };

const gens = new Generations(Dex);
let allPokemon = Dex.species.all().filter(pokemon => pokemon.exists && pokemon.num > 0 && pokemon.isNonstandard !== "CAP");
const currentYear = new Date().getFullYear();

export default async (interaction, ephemeral) => {
    // Command settings
    let ephemeralArg = interaction.options.getBoolean("ephemeral");
    if (ephemeralArg !== null) ephemeral = ephemeralArg;
    const emotesAllowed = areEmotesAllowed(interaction, ephemeral);
    // Bools
    let learnsetBool = false;
    let learnsetArg = interaction.options.getBoolean("learnset");
    if (learnsetArg === true) learnsetBool = true;
    let shinyBool = false;
    let shinyArg = interaction.options.getBoolean("shiny");
    if (shinyArg === true) shinyBool = true;
    // Variables
    let embedColor = globalVars.embedColor;
    let pokemonName = interaction.options.getString("pokemon");
    let pokemonButtons = new ActionRowBuilder();
    let returnString = "";
    let pokemonFiles = null;
    let nameBulbapedia = null;
    let linkBulbapedia = null;
    let colorPokemonName = null;
    // Set generation
    let generation = interaction.options.getInteger("generation") || globalVars.pokemonCurrentGeneration;
    let genData = gens.get(generation);
    let allPokemonGen = Array.from(genData.species).filter(pokemon => pokemon.exists && pokemon.num > 0 && !["CAP", "Future"].includes(pokemon.isNonstandard));
    // Used for pokemon and learn
    let pokemon = null;
    if (pokemonName) pokemon = Dex.species.get(pokemonName);
    let noPokemonString = `Sorry, I could not find a Pokémon called \`${pokemonName}\` in generation ${generation}.`;
    if (pokemonName && pokemonName.toLowerCase() == "random") pokemon = getRandomObjectItem(allPokemon);
    let pokemonExists = (pokemon && pokemon.exists && pokemon.num > 0);
    if (pokemonExists) colorPokemonName = pokemon.name;
    // Used for move and learn
    let moveSearch = interaction.options.getString("move");
    let move = Dex.moves.get(moveSearch);
    let moveExists = (move && move.exists && move.isNonstandard !== "CAP");
    // Embed initialization
    let pokemonEmbed = new EmbedBuilder();

    switch (interaction.options.getSubcommand()) {
        // Abilities
        case "ability":
            let abilitySearch = interaction.options.getString("ability");
            let ability = Dex.abilities.get(abilitySearch);
            let abilityGen = genData.abilities.get(abilitySearch);
            // let abilityGen = genData.abilities.get(abilitySearch);
            let abilityIsFuture = (ability.gen > generation); // Since abilities stay functional just undistributed, rarely get "Past" flag including Desolate Land and Primordial Sea
            let abilityFailString = `I could not find that ability in generation ${generation}.`;
            if (abilityIsFuture) abilityFailString += `\n\`${ability.name}\` was introduced in generation ${ability.gen}.`;
            if (!ability || !abilityGen || !ability.exists || ability.name == "No Ability" || ability.isNonstandard == "CAP" || abilityIsFuture) {
                pokemonEmbed
                    .setTitle("Error")
                    .setDescription(abilityFailString);
                return sendMessage({ interaction: interaction, embeds: pokemonEmbed, ephemeral: true });
            };

            nameBulbapedia = abilityGen.name.replace(/ /g, "_");
            // Ability is capitalized on Bulbapedia URLs
            linkBulbapedia = `https://bulbapedia.bulbagarden.net/wiki/${nameBulbapedia}_(Ability)`;

            let abilityMatches = Object.values(allPokemonGen).filter(pokemon => Object.values(pokemon.abilities).includes(abilityGen.name) && pokemon.exists && pokemon.num > 0);
            abilityMatches = abilityMatches.sort((pokemon1, pokemon2) => pokemon1.num - pokemon2.num);
            let abilityMatchesString = "";
            abilityMatches.forEach(match => abilityMatchesString += `${match.name}, `);
            abilityMatchesString = abilityMatchesString.slice(0, -2);
            if (abilityMatchesString.length == 0) abilityMatchesString = `No Pokémon has this ability in generation ${generation}.`;

            pokemonEmbed
                .setTitle(abilityGen.name)
                .setDescription(abilityGen.desc)
                .setFooter({ text: `Introduced in generation ${ability.gen} | Generation ${generation} data` })
                .addFields([{ name: "Pokémon:", value: abilityMatchesString, inline: false }]);
            break;
        // Items
        case "item":
            let itemSearch = interaction.options.getString("item");
            let item = Dex.items.get(itemSearch);
            let itemGen = genData.items.get(itemSearch);
            let generationFooter = generation; // Might be usefull to move to top of file
            let itemIsFuture = (item.gen > generation);
            let itemIsAvailable = (itemGen == undefined);
            let itemFailString = `I could not find that item in generation ${generation}.`;
            if (itemIsFuture) itemFailString += `\n\`${item.name}\` was introduced in generation ${item.gen}.`;
            if (!itemGen) {
                itemGen = item;
                generationFooter = globalVars.pokemonCurrentGeneration;
            };
            if (!item || !item.exists || item.isNonstandard == "CAP" || itemIsFuture) {
                pokemonEmbed
                    .setTitle("Error")
                    .setDescription(itemFailString);
                return sendMessage({ interaction: interaction, embeds: pokemonEmbed, ephemeral: true });
            };

            let itemImage = `https://www.serebii.net/itemdex/sprites/pgl/${itemGen.id}.png`;
            let hasPGLImage = urlExists(itemImage);
            if (!hasPGLImage) itemImage = `https://www.serebii.net/itemdex/sprites/sv/${itemGen.id}.png`;
            nameBulbapedia = itemGen.name.replace(/ /g, "_");
            linkBulbapedia = `https://bulbapedia.bulbagarden.net/wiki/${nameBulbapedia}`;
            if (item.itemUser) colorPokemonName = item.itemUser[0];

            let itemDescription = itemGen.desc;
            if (!itemDescription) itemDescription = itemGen.shortDesc; // This check is futureproofing can be removed when the following ps commit gets merged: https://github.com/smogon/pokemon-showdown/commit/6c46ab9924aac84fc9fbab5139d3eac5118fa71f
            if (itemIsAvailable) itemDescription += `\nThis item is not available in generation ${generation}.`;

            pokemonEmbed
                .setTitle(itemGen.name)
                .setThumbnail(itemImage)
                .setDescription(itemDescription)
                .setFooter({ text: `Introduced in generation ${item.gen} | Generation ${generationFooter} data` });
            if (itemGen.fling) pokemonEmbed.addFields([{ name: "Fling Power:", value: itemGen.fling.basePower.toString(), inline: true }]);
            break;
        // Moves
        case "move":
            let moveGen = genData.moves.get(moveSearch);
            let moveIsAvailable = true;
            if (!moveGen) {
                moveGen = move;
                moveIsAvailable = false;
            };
            let moveIsFuture = (move.gen > generation);
            let moveFailString = `I could not find that move in generation ${generation}.`;
            if (moveIsFuture) moveFailString += `\n\`${move.name}\` was introduced in generation ${move.gen}.`;
            if (!moveExists || moveIsFuture) {
                pokemonEmbed
                    .setTitle("Error")
                    .setDescription(moveFailString);
                return sendMessage({ interaction: interaction, embeds: pokemonEmbed, ephemeral: true });
            };

            let moveLearnPool = [];
            for (const pokemon of allPokemonGen) {
                if (isIdenticalForm(pokemon.name) || pokemon.name.startsWith("Terapagos-")) continue;
                let canLearnBool = await genData.learnsets.canLearn(pokemon.name, move.name);
                if (canLearnBool) moveLearnPool.push(pokemon.name);
            };

            let moveLearnPoolString = moveLearnPool.join(", ");
            if (moveLearnPoolString.length > 1024) moveLearnPoolString = `${moveLearnPool.length} Pokémon!`;
            // Capitalization doesn't matter for Bulbapedia URLs
            nameBulbapedia = moveGen.name.replace(/ /g, "_");
            linkBulbapedia = `https://bulbapedia.bulbagarden.net/wiki/${nameBulbapedia}_(move)`;

            let description = moveGen.desc;
            if (move.flags.contact) description += " Makes contact with the target.";
            if (move.flags.bypasssub) description += " Bypasses Substitute.";
            if (!moveIsAvailable) description += `\nThis move is not usable in generation ${generation}.`;

            let type = getTypeEmotes({ type: move.type, emotes: emotesAllowed });
            let category = move.category;
            let ppString = `${move.pp} (${Math.floor(move.pp * 1.6)})`;

            let accuracy = `${move.accuracy}%`;
            if (move.accuracy === true) accuracy = "Can't miss";
            // Smogon target is camelcased for some reason, this splits it on capital letters and formats them better
            let target = capitalizeString(move.target.split(/(?=[A-Z])/).join(" "));
            if (target == "Normal") target = "Any Adjacent";

            let moveTitle = move.name;
            if (move.isMax) moveTitle = `${move.name} (Max Move)`;
            if (move.isZ) moveTitle = `${move.name} (Z-Move)`;

            pokemonEmbed
                .setTitle(moveTitle)
                .setDescription(description)
                .setFooter({ text: `Introduced in generation ${move.gen} | Generation ${generation} data` });
            if (move.basePower > 1 && !move.isMax) pokemonEmbed.addFields([{ name: "Power:", value: move.basePower.toString(), inline: true }]);
            if (target !== "Self") pokemonEmbed.addFields([{ name: "Accuracy:", value: accuracy, inline: true }]);
            pokemonEmbed.addFields([
                { name: "Type:", value: type, inline: true },
                { name: "Category:", value: category, inline: true },
                { name: "Target:", value: target, inline: true }
            ]);
            if (move.critRatio !== 1) pokemonEmbed.addFields([{ name: "Crit Rate:", value: move.critRatio.toString(), inline: true }]);
            if (!move.isMax && !move.isZ) pokemonEmbed.addFields([{ name: "PP:", value: ppString, inline: true }]);
            if (move.priority !== 0) pokemonEmbed.addFields([{ name: "Priority:", value: move.priority.toString(), inline: true }]);
            if (move.contestType && [3, 4, 6].includes(generation)) pokemonEmbed.addFields([{ name: "Contest Type:", value: move.contestType, inline: true }]); // Gen 3, 4, 6 have contests. I think.
            if (move.zMove && move.zMove.basePower && generation == 7) pokemonEmbed.addFields([{ name: "Z-Power:", value: move.zMove.basePower.toString(), inline: true }]);
            if (move.maxMove && move.maxMove.basePower && generation == 8 && move.maxMove.basePower > 1 && !move.isMax) pokemonEmbed.addFields([{ name: "Max Move Power:", value: move.maxMove.basePower.toString(), inline: true }]);
            if (moveLearnPool.length > 0) pokemonEmbed.addFields([{ name: `Learned By:`, value: moveLearnPoolString, inline: false }]);
            break;
        // Natures
        case "nature":
            let natureSearch = interaction.options.getString("nature");
            let nature = Dex.natures.get(natureSearch);
            if (!nature || !nature.exists) return sendMessage({ interaction: interaction, content: `Sorry, I could not find that nature.` });

            let boosted = Dex.stats.names[nature.plus];
            let lowered = Dex.stats.names[nature.minus];
            let arrowUpEmote = "<:arrow_up_red:909901820732784640>";
            let arrowDownEmote = "<:arrow_down_blue:909903420054437929>";
            let resultString = "Neutral nature, no stat changes.";
            if (boosted && lowered) {
                if (emotesAllowed) {
                    boosted = `${arrowUpEmote}${boosted}`;
                    lowered = `${arrowDownEmote}${lowered}`;
                } else {
                    boosted = `Boosted: ${boosted}`;
                    lowered = `Lowered: ${lowered}`;
                };
                resultString = `${boosted}\n${lowered}`;
            };
            pokemonEmbed
                .setTitle(nature.name)
                .setDescription(resultString);
            break;
        // Format
        case "format":
            let formatSearch = interaction.options.getString("format");
            let format = DexSim.formats.get(formatSearch);
            if (!format || !format.exists) return sendMessage({ interaction: interaction, content: `Sorry, I could not find a format by that name.` });

            if (format.threads) {
                format.threads.forEach(thread => {
                    const threadButton = new ButtonBuilder()
                        .setLabel(thread.split(">")[1].split("<")[0])
                        .setStyle(ButtonStyle.Link)
                        .setURL(thread.split("\"")[1]);
                    pokemonButtons.addComponents(threadButton);
                });
            };
            // Leading newlines get ignored if format.desc is empty
            let formatDescription = (format.desc + "\n").replace(/&eacute;/g, "é");
            if (format.searchShow) {
                formatDescription += `\nThis format has an ongoing [ladder](https://pokemonshowdown.com/ladder/${format.id}).`;
            } else if (format.rated) {
                formatDescription += `\nThis format has a [ladder](https://pokemonshowdown.com/ladder/${format.id}) but can not currently be played on said ladder.`;
            } else {
                formatDescription += "\nThis format does not have a ladder.";
            };
            if (format.challengeShow) {
                formatDescription += "\nYou can challenge users in this format.";
            } else {
                formatDescription += "\nYou can not challenge users in this format.";
            };
            if (format.tournamentShow) {
                formatDescription += "\nThis format can be used for tournaments.";
            } else {
                formatDescription += "\nThis format can not be used for tournaments.";
            };
            let ruleset = null;
            if (format.ruleset && format.ruleset.length > 0) ruleset = format.ruleset.join(", ");
            let banlist = null;
            if (format.banlist && format.banlist.length > 0) banlist = format.banlist.join(", ");
            let unbanlist = null;
            if (format.unbanlist && format.unbanlist.length > 0) unbanlist = format.unbanlist.join(", ");

            pokemonEmbed
                .setTitle(`${format.name} (${format.section})`)
                .setDescription(formatDescription)
            if (ruleset) pokemonEmbed.addFields([{ name: "Ruleset:", value: ruleset, inline: false }]);
            if (banlist) pokemonEmbed.addFields([{ name: "Banlist:", value: banlist, inline: false }]);
            if (unbanlist) pokemonEmbed.addFields([{ name: "Unbanlist:", value: unbanlist, inline: false }]);
            if (format.restricted && format.restricted.length > 0) pokemonEmbed.addFields([{ name: "Restricted type:", value: format.restricted.join(", "), inline: false }]);
            break;
        case "learn":
            if (!pokemonExists) return sendMessage({ interaction: interaction, content: noPokemonString });
            if (!moveExists) return sendMessage({ interaction: interaction, content: `Sorry, I could not find a move called \`${moveSearch}\`.` });
            // Set variables
            let learnAuthor = `${pokemon.name} learns ${move.name}`;
            let learnInfo = "";

            let prevo = Dex.species.get(pokemon.prevo);
            let prevoLearnset = null;
            let prevoprevoLearnset = null;
            let pokemonLearnset = await Dex.learnsets.get(pokemon.id);
            pokemonLearnset = await checkBaseSpeciesMoves(pokemon, pokemonLearnset);
            if (pokemon.prevo) prevoLearnset = await Dex.learnsets.get(pokemon.prevo);
            if (prevoLearnset && prevo.prevo) prevoprevoLearnset = await Dex.learnsets.get(prevo.prevo);

            let learnsMove = false;
            if ((pokemonLearnset && pokemonLearnset.learnset && pokemonLearnset.learnset[move.id]) ||
                (prevoLearnset && prevoLearnset.learnset && prevoLearnset.learnset[move.id]) ||
                (prevoprevoLearnset && prevoprevoLearnset.learnset && prevoprevoLearnset.learnset[move.id])) learnsMove = true;

            if (learnsMove) {
                if (pokemonLearnset.learnset && pokemonLearnset.learnset[move.id]) learnInfo += getLearnData(pokemonLearnset?.learnset[move.id]);
                while (prevoLearnset && prevoLearnset.learnset && prevoLearnset.learnset[move.id]) {
                    learnInfo += `**As ${prevo.name}:**\n`;
                    let learnDataToAdd = getLearnData(prevoLearnset.learnset[move.id]);
                    if (learnDataToAdd.length > 0) learnsMove = true;
                    learnInfo += learnDataToAdd;
                    // Set up next loop
                    prevo = Dex.species.get(prevo.prevo);
                    prevoLearnset = await Dex.learnsets.get(prevo.id);
                };
                pokemonEmbed.setDescription(learnInfo);
            } else {
                learnAuthor = `${pokemon.name} does not learn ${move.name}`;
            };
            pokemonEmbed.setTitle(learnAuthor);
            break;
        case "usage":
            let formatInput = "gen9vgc2023series1";
            let formatArg = interaction.options.getString("format");
            if (formatArg) formatInput = formatArg;
            // There's a LOT of inconsistencies between the format names in Showdown and https://www.smogon.com/stats/
            if (formatInput == "gen7vgc2019") formatInput = "gen7vgc2019ultraseries";

            let rating = 0;
            let ratingTresholds = [0, 1500, 1630, 1760];
            if (formatInput.match(/gen.{1,2}(ou)$/g)) ratingTresholds = [0, 1500, 1695, 1825]; // OU has different rating tresholds
            let ratingArg = interaction.options.getInteger("rating");
            if (ratingTresholds.includes(ratingArg)) rating = ratingArg;

            let month = interaction.options.getInteger("month");
            let year = interaction.options.getInteger("year");
            // Indexing makes it 1 lower than the "natural" number associated with a month, but we want last month's data anyways so that works itself out
            const date = new Date();
            if (!year) year = date.getFullYear();
            if (!month) {
                month = date.getMonth();
                // Test month existence, otherwise default to last month
                let currentMonnthExists = urlExists(`https://www.smogon.com/stats/${year}-${leadingZeros(month, 2)}/`);
                console.log(currentMonnthExists)
                if (!currentMonnthExists) month = month - 1;
            };
            if (month < 1) {
                month += 12;
                year -= 1;
            };
            let stringMonth = leadingZeros(month, 2);
            // Format URL and other variables
            let searchURL = `https://www.smogon.com/stats/${year}-${stringMonth}/moveset/${formatInput}-${rating}.txt`;
            let genericUsageURL = `https://www.smogon.com/stats/${year}-${stringMonth}/${formatInput}-${rating}.txt`
            let response = null;
            let genericUsageResponse = null;
            let failText = `Could not fetch data for the inputs you provided.\nThe most common reasons for this are spelling mistakes and a lack of Smogon data. If it's early in the month it's possible usage for last month has not been uploaded yet.`;
            const usageButtonSimple = new ButtonBuilder()
                .setLabel("Showdown Usage")
                .setStyle(ButtonStyle.Link)
                .setURL("https://www.smogon.com/stats/");
            const usageButtonDetailed = new ButtonBuilder()
                .setLabel("Showdown Usage (Detailed)")
                .setStyle(ButtonStyle.Link)
                .setURL(searchURL);
            let usageButtons = new ActionRowBuilder()
                .addComponents([usageButtonSimple, usageButtonDetailed]);
            // Check URL validity. Make a prettier embed for this one day
            let searchURLExists = urlExists(searchURL);
            let genericUsageResponseURLExists = urlExists(genericUsageURL);
            if (!searchURLExists || !genericUsageResponseURLExists) return sendMessage({ interaction: interaction, content: failText, components: usageButtons });
            response = await axios.get(searchURL);
            genericUsageResponse = await axios.get();
            // Filter, split and trim pokemon data
            let usageArray = response.data.replace(/\|/g, "").replace(/\n/g, "").trim().split(`----------------------------------------+  +----------------------------------------+`);
            Object.keys(usageArray).forEach(key => { usageArray[key] = usageArray[key].replace(/\+/g, "").replace(/--/g, "") });
            usageArray = usageArray.map(element => element.trim());
            // Variables for generic usage data
            // let totalBattleCount = genericUsageResponse.data.split("battles: ")[1].split("Avg.")[0].replace("\n", "").trim();
            let rawUsage = 0;
            let usagePercentage = 0;
            let usageRank = 0;
            let genericDataSplitPokemon = null;
            let pokemonDataSplitLine = null;
            if (pokemonName) {
                let usagePokemonString = usageArray.find(element => element.startsWith(pokemonName + " ")); // Space is to exclude matching more popular subforms
                if (!usagePokemonString) return sendMessage({ interaction: interaction, content: `Could not find any data for ${pokemonName} in ${formatInput} during the specified month.`, components: usageButtons });
                // Data from generic usage page
                genericDataSplitPokemon = genericUsageResponse.data.split(pokemonName);
                pokemonDataSplitLine = genericDataSplitPokemon[1].split("|");
                rawUsage = pokemonDataSplitLine[2].trim();
                usagePercentage = `${Math.round(pokemonDataSplitLine[1].trim().replace("%", "") * 100) / 100}%`;
                usageRank = genericDataSplitPokemon[0].split("|");
                usageRank = usageRank[usageRank.length - 2].trim();
                // Specific data, .map() is to trim each entry in the array to avoid weird spacing on mobile clients
                let abilitiesString = usagePokemonString.split("Abilities")[1].split("Items")[0].split("%").map(function (x) { return x.trim(); }).join("%\n").replace(/   /g, "");
                let itemsString = usagePokemonString.split("Items")[1].split("Spreads")[0].split("%").map(function (x) { return x.trim(); }).join("%\n").replace(/   /g, "");
                let spreadsString = usagePokemonString.split("Spreads")[1].split("Moves")[0].split("%").map(function (x) { return x.trim(); }).join("%\n").replace(/   /g, "").replace(/:/g, " ");
                let movesString = usagePokemonString.split("Moves")[1].split("Teammates")[0].split("%").map(function (x) { return x.trim(); }).join("%\n").replace(/   /g, "");
                let teammatesString = usagePokemonString.split("Teammates")[1].split("Checks and Counters")[0].split("%").map(function (x) { return x.trim(); }).join("%\n").replace(/   /g, "");
                let countersString = usagePokemonString.split("Checks and Counters")[1].split("out)").map(function (x) { return x.trim(); }).join("out)\n").replace(/   /g, "");
                pokemonEmbed
                    .setTitle(`${pokemonName} ${formatInput} ${rating}+ (${stringMonth}/${year})`)
                    .setDescription(`#${usageRank} | ${usagePercentage} | ${rawUsage} uses`)
                    .addFields([
                        { name: "Moves:", value: movesString, inline: true },
                        { name: "Items:", value: itemsString, inline: true },
                        { name: "Abilities:", value: abilitiesString, inline: true },
                        { name: "Spreads:", value: spreadsString, inline: true },
                        { name: "Teammates:", value: teammatesString, inline: true }
                    ]);
                if (countersString.length > 0) pokemonEmbed.addFields([{ name: "Checks and Counters:", value: countersString, inline: false }]);
            } else {
                // Format generic data display
                let usageList = [];
                let usageListIndex = 1;
                await usageArray.forEach(element => {
                    pokemonName = element.split("Raw count")[0].trim();
                    // Percentage determination copied from generic usage data parsing for specific pokemon
                    genericDataSplitPokemon = genericUsageResponse.data.split(pokemonName);
                    pokemonDataSplitLine = genericDataSplitPokemon[1].split("|");
                    usagePercentage = `${Math.round(pokemonDataSplitLine[1].trim().replace("%", "") * 100) / 100}%`;
                    usageList.push(`${usageListIndex}.${pokemonName} ${usagePercentage}`);
                    usageListIndex++;
                });
                let usageListPart1 = [];
                let usageListPart2 = [];
                usageList.forEach(element => { if (usageListPart1.length < 50) usageListPart1.push(element); else if (usageListPart2.length < 50) usageListPart2.push(element) });
                pokemonEmbed
                    .setTitle(`Usage for ${formatInput} ${rating}+ (${stringMonth}/${year})`)
                    .addFields([
                        { name: "1-50", value: usageListPart1.join("\n"), inline: true },
                        { name: "51-100", value: usageListPart2.join("\n"), inline: true }
                    ]);
            };
            break;
        case "whosthat":
            pokemonEmbed = null;
            await interaction.deferReply({ ephemeral: ephemeral });
            allPokemon = allPokemon.filter(pokemon =>
                !isIdenticalForm(pokemon.name) &&
                !pokemon.name.startsWith("Basculin-") &&
                !pokemon.name.startsWith("Basculegion-") &&
                !pokemon.name.endsWith("-Totem")
            );
            let whosThatPokemonMessageObject = await getWhosThatPokemon({ pokemonList: allPokemon });
            returnString = whosThatPokemonMessageObject.content;
            pokemonFiles = whosThatPokemonMessageObject.files;
            pokemonButtons = whosThatPokemonMessageObject.components;
            break;
        // Pokémon
        case "pokemon":
            if (!pokemonExists) return sendMessage({ interaction: interaction, content: noPokemonString });
            let messageObject = await getPokemon({ interaction: interaction, pokemon: pokemon, learnsetBool: learnsetBool, shinyBool: shinyBool, genData: genData, ephemeral: ephemeral });
            pokemonEmbed = messageObject.embeds[0];
            pokemonButtons = messageObject.components;
            break;
    };
    // Bulbapedia button
    if (linkBulbapedia) {
        const bulbapediaButton = new ButtonBuilder()
            .setLabel("More info")
            .setStyle(ButtonStyle.Link)
            .setURL(linkBulbapedia);
        pokemonButtons.addComponents(bulbapediaButton);
    };
    // Color check for non-Pokémon commands
    if (pokemonEmbed) {
        const pokemonSim = DexSim.forGen(genData.dex.gen).species.get(colorPokemonName);
        if (pokemonSim.color) embedColor = colorHexes[pokemonSim.color.toLowerCase()];
        pokemonEmbed.setColor(embedColor);
    };
    return sendMessage({ interaction: interaction, content: returnString, embeds: pokemonEmbed, components: pokemonButtons, files: pokemonFiles, ephemeral: ephemeral });
};

function getLearnData(learnData) {
    let learnInfo = "";
    if (learnData.length == 0) return learnInfo;
    learnData.forEach(learnMethod => {
        let learnGen = learnMethod.charAt(0);
        let learnType = learnMethod.charAt(1);
        let learnGenString = `Gen ${learnGen}:`;
        switch (learnType) {
            case "L":
                learnInfo += `${learnGenString} Level ${learnMethod.split("L")[1]}\n`;
                break;
            case "M":
                learnInfo += `${learnGenString} TM\n`;
                break;
            case "T":
                learnInfo += `${learnGenString} Move Tutor\n`;
                break;
            case "E":
                learnInfo += `${learnGenString} Egg move\n`;
                break;
            case "R":
                learnInfo += `${learnGenString} Reminder\n`;
                break;
            case "S":
                let specialMoveString = `${learnGenString} Special\n`;
                if (!learnInfo.includes(specialMoveString) && !learnInfo.includes(learnGenString)) learnInfo += specialMoveString;
                break;
            case "V":
                let virtualConsoleMoveString = `${learnGenString} Virtual Console\n`;
                if (!learnInfo.includes(virtualConsoleMoveString) && !learnInfo.includes(learnGenString)) learnInfo += virtualConsoleMoveString;
                break;
        };
    });
    return learnInfo;
};

// "Identical" here means having the same sillouette and learnset
function isIdenticalForm(pokemonName) {
    if (pokemonName.startsWith("Arceus-") ||
        pokemonName.startsWith("Silvally-") ||
        pokemonName.startsWith("Vivillon-") ||
        pokemonName.startsWith("Genesect-") ||
        pokemonName.startsWith("Gourgeist-") ||
        pokemonName.startsWith("Pumpkaboo-") ||
        pokemonName.startsWith("Squawkabilly-") ||
        pokemonName.endsWith("-Tera") || // Ogerpon Tera forms, remove when Serebii adds proper images for them
        ["Flapple-Gmax", "Appletun-Gmax", "Toxtricity-Gmax", "Toxtricity-Low-Key-Gmax"].includes(pokemonName)) return true;
    return false;
};

const pokemonOptionName = "pokemon";
const pokemonOptionDescription = "Pokémon to get info on.";
const generationOptionName = "generation";
const generationOptionDescription = "Generation to use.";
// String options
const pokemonOption = new SlashCommandStringOption()
    .setName(pokemonOptionName)
    .setDescription(pokemonOptionDescription)
    .setAutocomplete(true);
const pokemonOptionRequired = new SlashCommandStringOption()
    .setName(pokemonOptionName)
    .setDescription(pokemonOptionDescription)
    .setAutocomplete(true)
    .setRequired(true);
const abilityOption = new SlashCommandStringOption()
    .setName("ability")
    .setDescription("Ability to get info on.")
    .setAutocomplete(true)
    .setRequired(true);
const itemOption = new SlashCommandStringOption()
    .setName("item")
    .setDescription("Item to get info on.")
    .setAutocomplete(true)
    .setRequired(true);
const moveOption = new SlashCommandStringOption()
    .setName("move")
    .setDescription("Move to get info on.")
    .setAutocomplete(true)
    .setRequired(true);
const natureOption = new SlashCommandStringOption()
    .setName("nature")
    .setDescription("Nature to get info on.")
    .setAutocomplete(true)
    .setRequired(true);
const formatOption = new SlashCommandStringOption()
    .setName("format")
    .setDescription("Format to get info on.")
    .setAutocomplete(true)
    .setRequired(true);
// Integer options
const generationOption = new SlashCommandIntegerOption()
    .setName(generationOptionName)
    .setDescription(generationOptionDescription)
    .setMinValue(1)
    .setMaxValue(globalVars.pokemonCurrentGeneration);
const generationOptionAbilities = new SlashCommandIntegerOption()
    .setName(generationOptionName)
    .setDescription(generationOptionDescription)
    .setMinValue(3)
    .setMaxValue(globalVars.pokemonCurrentGeneration);
const monthOption = new SlashCommandIntegerOption()
    .setName("month")
    .setDescription("Month (number) to get data from.")
    .setMinValue(1)
    .setMaxValue(12);
const yearOption = new SlashCommandIntegerOption()
    .setName("year")
    .setDescription("Year to get data from.")
    .setMinValue(2014)
    .setMaxValue(currentYear);
const ratingOption = new SlashCommandIntegerOption()
    .setName("rating")
    .setDescription("Minimum rating to get data from.")
    .setMinValue(1000)
    .setMaxValue(1825)
    .setAutocomplete(true);
// Boolean options
const learnsetOption = new SlashCommandBooleanOption()
    .setName("learnset")
    .setDescription("Whether to show the Pokémon's learnset.");
const shinyOption = new SlashCommandBooleanOption()
    .setName("shiny")
    .setDescription("Whether to show the Pokémon's shiny sprite.");
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Subcommands
const pokemonSubcommand = new SlashCommandSubcommandBuilder()
    .setName("pokemon")
    .setDescription("Get info on a Pokémon.")
    .addStringOption(pokemonOptionRequired)
    .addIntegerOption(generationOption)
    .addBooleanOption(learnsetOption)
    .addBooleanOption(shinyOption)
    .addBooleanOption(ephemeralOption);
const abilitySubcommand = new SlashCommandSubcommandBuilder()
    .setName("ability")
    .setDescription("Get info on an ability.")
    .addStringOption(abilityOption)
    .addIntegerOption(generationOptionAbilities)
    .addBooleanOption(ephemeralOption);
const moveSubcommand = new SlashCommandSubcommandBuilder()
    .setName("move")
    .setDescription("Get info on a move.")
    .addStringOption(moveOption)
    .addIntegerOption(generationOption)
    .addBooleanOption(ephemeralOption);
const itemSubcommand = new SlashCommandSubcommandBuilder()
    .setName("item")
    .setDescription("Get info on an item.")
    .addStringOption(itemOption)
    .addIntegerOption(generationOption)
    .addBooleanOption(ephemeralOption);
const natureSubcommand = new SlashCommandSubcommandBuilder()
    .setName("nature")
    .setDescription("Get info on a nature.")
    .addStringOption(natureOption)
    .addBooleanOption(ephemeralOption);
const formatSubcommand = new SlashCommandSubcommandBuilder()
    .setName("format")
    .setDescription("Get info on a format.")
    .addStringOption(formatOption)
    .addBooleanOption(ephemeralOption);
const learnSubcommand = new SlashCommandSubcommandBuilder()
    .setName("learn")
    .setDescription("Check if a Pokémon can learn a move")
    .addStringOption(pokemonOptionRequired)
    .addStringOption(moveOption)
    .addBooleanOption(ephemeralOption)
const usageSubcommand = new SlashCommandSubcommandBuilder()
    .setName("usage")
    .setDescription("Shows Smogon usage data.")
    .addStringOption(formatOption)
    .addStringOption(pokemonOption)
    .addIntegerOption(monthOption)
    .addIntegerOption(yearOption)
    .addIntegerOption(ratingOption)
    .addBooleanOption(ephemeralOption);
const whosThatSubcommand = new SlashCommandSubcommandBuilder()
    .setName("whosthat")
    .setDescription("Who's that Pokémon?")
    .addBooleanOption(ephemeralOption);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("pokemon")
    .setDescription("Shows Pokémon data.")
    .addSubcommand(pokemonSubcommand)
    .addSubcommand(abilitySubcommand)
    .addSubcommand(moveSubcommand)
    .addSubcommand(itemSubcommand)
    .addSubcommand(natureSubcommand)
    .addSubcommand(formatSubcommand)
    .addSubcommand(learnSubcommand)
    .addSubcommand(usageSubcommand)
    .addSubcommand(whosThatSubcommand);