import Discord from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import isAdmin from "../../util/isAdmin.js";
import axios from "axios";
import pkm from "pokemon-showdown";
const { Dex } = pkm;
import getPokemon from "../../util/pokemon/getPokemon.js";
import getWhosThatPokemon from "../../util/pokemon/getWhosThatPokemon.js";
import getTypeEmotes from "../../util/pokemon/getTypeEmotes.js";
import capitalizeString from "../../util/capitalizeString.js";
import leadingZeros from "../../util/leadingZeros.js";
import getRandomObjectItem from "../../util/getRandomObjectItem.js";
import learnsets from "../../node_modules/pokemon-showdown/dist/data/learnsets.js";
import retroLearnsets from "../../node_modules/pokemon-showdown/dist/data/mods/gen2/learnsets.js";
import checkBaseSpeciesMoves from "../../util/pokemon/checkBaseSpeciesMoves.js";
import imageExists from "../../util/imageExists.js";

let currentGeneration = 9; // Set current generation

export default async (client, interaction, ephemeral) => {
    try {
        let learnsetsObject = learnsets.Learnsets;
        let retroLearnsetsObject = retroLearnsets.Learnsets;
        // Command settings
        let adminBot = isAdmin(client, interaction.guild.members.me);
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg !== null) ephemeral = ephemeralArg;
        let emotesAllowed = true;
        if (ephemeral == true && !interaction.guild.members.me.permissions.has(Discord.PermissionFlagsBits.UseExternalEmojis) && !adminBot) emotesAllowed = false;
        // Bools
        let learnsetBool = false;
        let learnsetArg = interaction.options.getBoolean("learnset");
        if (learnsetArg === true) learnsetBool = true;
        let shinyBool = false;
        let shinyArg = interaction.options.getBoolean("shiny");
        if (shinyArg === true) shinyBool = true;
        // Variables
        let pokemonEmbed = new Discord.EmbedBuilder()
            .setColor(globalVars.embedColor);
        let pokemonName = interaction.options.getString("pokemon");
        let pokemonButtons = new Discord.ActionRowBuilder();
        let returnString = "";
        let pokemonFiles = null;
        let nameBulbapedia = null;
        let linkBulbapedia = null;
        // Set generation
        let generationInput = interaction.options.getInteger("generation") || currentGeneration;
        let dexModified = Dex.mod(`gen${generationInput}`);
        let allPokemon = dexModified.species.all().filter(pokemon => pokemon.exists && pokemon.num > 0 && !["CAP", "Future"].includes(pokemon.isNonstandard));
        // Used for pokemon and learn
        let pokemon = dexModified.species.get(pokemonName);
        let noPokemonString = `Sorry, I could not find a Pokémon called \`${pokemonName}\` in generation ${generationInput}.`;
        if (pokemonName && pokemonName.toLowerCase() == "random") pokemon = getRandomObjectItem(allPokemon);
        let pokemonExists = (pokemon && pokemon.exists && pokemon.num > 0);
        // Used for move and learn
        let moveSearch = interaction.options.getString("move");
        let move = dexModified.moves.get(moveSearch);
        let moveExists = (move && move.exists && !["CAP", "Future"].includes(move.isNonstandard));

        switch (interaction.options.getSubcommand()) {
            // Abilities
            case "ability":
                let abilitySearch = interaction.options.getString("ability");
                let ability = dexModified.abilities.get(abilitySearch);
                if (!ability || !ability.exists || ability.name == "No Ability" || ability.isNonstandard == "CAP") return sendMessage({ client: client, interaction: interaction, content: `Sorry, I could not find an ability by that name.` });

                nameBulbapedia = ability.name.replaceAll(" ", "_");
                // Ability is capitalized on Bulbapedia URLs
                linkBulbapedia = `https://bulbapedia.bulbagarden.net/wiki/${nameBulbapedia}_(Ability)`;

                let abilityMatches = Object.values(allPokemon).filter(pokemon => Object.values(pokemon.abilities).includes(ability.name) && pokemon.exists && pokemon.num > 0);
                abilityMatches = abilityMatches.sort((pokemon1, pokemon2) => pokemon1.num - pokemon2.num);
                let abilityMatchesString = "";
                abilityMatches.forEach(match => abilityMatchesString += `${match.name}, `);
                abilityMatchesString = abilityMatchesString.slice(0, -2);

                pokemonEmbed
                    .setTitle(ability.name)
                    .setDescription(ability.desc)
                    .setFooter({ text: `Introduced in generation ${ability.gen} | Generation ${generationInput} data` });
                if (abilityMatchesString.length > 0) pokemonEmbed.addFields([{ name: "Pokémon:", value: abilityMatchesString, inline: false }]);
                break;
            // Items
            case "item":
                let itemSearch = interaction.options.getString("item");
                let item = dexModified.items.get(itemSearch);
                if (!item || !item.exists || ["Future", "CAP"].includes(item.isNonstandard)) return sendMessage({ client: client, interaction: interaction, content: `Sorry, I could not find an item called \`${itemSearch}\` in generation ${generationInput}.` });

                let itemImage = `https://www.serebii.net/itemdex/sprites/pgl/${item.id}.png`;
                let hasPGLImage = await imageExists(itemImage);
                if (!hasPGLImage) itemImage = `https://www.serebii.net/itemdex/sprites/sv/${item.id}.png`;
                nameBulbapedia = item.name.replaceAll(" ", "_");
                linkBulbapedia = `https://bulbapedia.bulbagarden.net/wiki/${nameBulbapedia}`;

                let itemDescription = item.desc;
                if (item.isNonstandard == "Past") itemDescription += `\nThis item is not available in generation ${generationInput}.`;

                pokemonEmbed
                    .setTitle(item.name)
                    .setThumbnail(itemImage)
                    .setDescription(itemDescription)
                    .setFooter({ text: `Introduced in generation ${item.gen} | Generation ${generationInput} data` });
                if (item.fling) pokemonEmbed.addFields([{ name: "Fling Power:", value: item.fling.basePower.toString(), inline: true }]);
                break;
            // Moves
            case "move":
                if (!moveExists) return sendMessage({ client: client, interaction: interaction, content: `Sorry, I could not find a move called \`${moveSearch}\` in generation ${generationInput}.` });
                let moveLearnPool = [];
                for await (const [key, value] of Object.entries(learnsetsObject)) {
                    let pokemonMatch = allPokemon.find(pokemon => pokemon.id == key);
                    if (!pokemonMatch || !pokemonMatch.exists || pokemonMatch.num <= 0 || !value.learnset || ["CAP", "Future"].includes(pokemonMatch.isNonstandard)) continue;
                    if (!Object.keys(value.learnset).includes(move.id)) continue;
                    if (value.learnset[move.id].some(learnstring => learnstring.startsWith(generationInput))) moveLearnPool.push(pokemonMatch.name);
                };
                let moveLearnPoolString = moveLearnPool.join(", ");
                if (moveLearnPoolString.length > 1024) moveLearnPoolString = `${moveLearnPool.length} Pokémon!`;

                nameBulbapedia = move.name.replaceAll(" ", "_");
                // Move is NOT capitalized on Bulbapedia URLs
                linkBulbapedia = `https://bulbapedia.bulbagarden.net/wiki/${nameBulbapedia}_(move)`;

                let description = move.desc;
                if (move.flags.contact) description += " Makes contact with the target.";
                if (move.flags.bypasssub) description += " Bypasses Substitute.";
                if (move.isNonstandard == "Past") description += `\nThis move is not usable in generation ${generationInput}.`;

                let type = getTypeEmotes({ type1: move.type, emotes: emotesAllowed });
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
                    .setFooter({ text: `Introduced in generation ${move.gen} | Generation ${generationInput} data` });
                if (move.basePower > 1 && !move.isMax) pokemonEmbed.addFields([{ name: "Power:", value: move.basePower.toString(), inline: true }]);
                if (target !== "Self") pokemonEmbed.addFields([{ name: "Accuracy:", value: accuracy, inline: true }]);
                pokemonEmbed.addFields([
                    { name: "Type:", value: type, inline: true },
                    { name: "Category:", value: category, inline: true },
                    { name: "Target:", value: target, inline: true }
                ]);
                if (move.critRatio !== 1) pokemonEmbed.addFields([{ name: "Crit Rate:", value: move.critRatio.toString(), inline: true }]);
                if (!move.isMax) pokemonEmbed.addFields([{ name: "PP:", value: ppString, inline: true }]);
                if (move.priority !== 0) pokemonEmbed.addFields([{ name: "Priority:", value: move.priority.toString(), inline: true }]);
                if (move.contestType && [3, 4, 6].includes(generationInput)) pokemonEmbed.addFields([{ name: "Contest Type:", value: move.contestType, inline: true }]); // Gen 3, 4, 6 have contests. I think.
                if (move.zMove && move.zMove.basePower && generationInput == 7) pokemonEmbed.addFields([{ name: "Z-Power:", value: move.zMove.basePower.toString(), inline: true }]);
                if (move.maxMove && move.maxMove.basePower && generationInput == 8 && move.maxMove.basePower > 1 && !move.isMax) pokemonEmbed.addFields([{ name: "Max Move Power:", value: move.maxMove.basePower.toString(), inline: true }]);
                if (moveLearnPool.length > 0) pokemonEmbed.addFields([{ name: `Learned By:`, value: moveLearnPoolString, inline: false }]);
                break;
            // Natures
            case "nature":
                let natureSearch = interaction.options.getString("nature");
                let nature = Dex.natures.get(natureSearch);
                if (!nature || !nature.exists) return sendMessage({ client: client, interaction: interaction, content: `Sorry, I could not find a nature called \`${natureSerach}\`.` });

                let boosted = Dex.stats.names[nature.plus];
                let lowered = Dex.stats.names[nature.minus];
                let arrowUp = "<:arrow_up_red:909901820732784640>";
                let arrowDown = "<:arrow_down_blue:909903420054437929>";
                let resultString = "Neutral nature, no stat changes.";
                if (boosted && lowered) {
                    if (emotesAllowed) {
                        boosted = `${arrowUp}${boosted}`;
                        lowered = `${arrowDown}${lowered}`;
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
                let format = Dex.formats.get(formatSearch);
                if (!format || !format.exists) return sendMessage({ client: client, interaction: interaction, content: `Sorry, I could not find a format by that name.` });

                if (format.threads) {
                    format.threads.forEach(thread => {
                        pokemonButtons.addComponents(new Discord.ButtonBuilder({ label: thread.split(">")[1].split("<")[0], style: Discord.ButtonStyle.Link, url: thread.split("\"")[1] }));
                    });
                };
                // Leading newlines get ignored if format.desc is empty
                let formatDescription = (format.desc + "\n").replaceAll("&eacute;", "é");
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
            // Pokémon
            case "pokemon":
                if (!pokemonExists) return sendMessage({ client: client, interaction: interaction, content: noPokemonString });
                let messageObject = await getPokemon({ client: client, interaction: interaction, pokemon: pokemon, learnsetBool: learnsetBool, shinyBool: shinyBool, generation: generationInput, ephemeral: ephemeral });
                pokemonEmbed = messageObject.embeds;
                pokemonButtons = messageObject.components;
                break;
            case "learn":
                if (!pokemonExists) return sendMessage({ client: client, interaction: interaction, content: noPokemonString });
                if (!moveExists) return sendMessage({ client: client, interaction: interaction, content: `Sorry, I could not find a move called \`${moveSearch}\`.` });
                // Set variables
                let learnAuthor = `${pokemon.name} learns ${move.name}`;
                let learnInfo = "";
                let learnsMove = false;
                let prevo = null;
                let prevoprevo = null;
                let evoTreeLearnsets = {}; // Merge, first object's properties get overwritten by second object's properties
                if (pokemon.prevo) prevo = dexModified.species.get(pokemon.prevo);
                if (prevo && prevo.prevo) prevoprevo = dexModified.species.get(prevo.prevo);
                // Might be better and cleaner to combine the learnsets files into a single file/object at launch or with a seperate script instead of doing all these checks and awaited for loops every command run
                evoTreeLearnsets[pokemon.id] = { ...retroLearnsetsObject[pokemon.id], ...learnsetsObject[pokemon.id] };
                // Merge these if statements into a singular function
                if (retroLearnsetsObject[pokemon.id]) {
                    for await (let [key, value] of Object.entries(evoTreeLearnsets[pokemon.id].learnset)) {
                        // Moves not learned in gen 1-2 are null, so should be avoided concatenating
                        if (retroLearnsetsObject[pokemon.id].learnset[key]) evoTreeLearnsets[pokemon.id].learnset[key] = evoTreeLearnsets[pokemon.id].learnset[key].concat(retroLearnsetsObject[pokemon.id].learnset[key]);
                    };
                };
                if (prevo && retroLearnsetsObject[prevo.id]) {
                    evoTreeLearnsets[prevo.id] = { ...retroLearnsetsObject[prevo.id], ...learnsetsObject[prevo.id] };
                    for await (let [key, value] of Object.entries(evoTreeLearnsets[prevo.id].learnset)) {
                        if (retroLearnsetsObject[prevo.id].learnset[key]) evoTreeLearnsets[prevo.id].learnset[key] = evoTreeLearnsets[prevo.id].learnset[key].concat(retroLearnsetsObject[prevo.id].learnset[key]);
                    };
                };
                if (prevoprevo && retroLearnsetsObject[prevoprevo.id]) {
                    evoTreeLearnsets[prevoprevo.id] = { ...retroLearnsetsObject[prevoprevo.id], ...learnsetsObject[prevoprevo.id] };
                    for await (let [key, value] of Object.entries(evoTreeLearnsets[prevoprevo.id].learnset)) {
                        if (retroLearnsetsObject[prevoprevo.id].learnset[key]) evoTreeLearnsets[prevoprevo.id].learnset[key] = evoTreeLearnsets[prevoprevo.id].learnset[key].concat(retroLearnsetsObject[prevoprevo.id].learnset[key]);
                    };
                };
                learnsetsObject = { ...learnsetsObject, ...evoTreeLearnsets };
                if (learnsetsObject[pokemon.id]) {
                    let learnset = learnsetsObject[pokemon.id].learnset;
                    learnset = await checkBaseSpeciesMoves(Dex, learnsetsObject, pokemon);
                    for (let [moveName, learnData] of Object.entries(learnset)) {
                        if (moveName !== move.id) continue;
                        learnsMove = true;
                        learnInfo += getLearnData(learnData);
                    };
                    while (prevo && prevo.num > 0) {
                        let prevoLearnset = learnsetsObject[prevo.id].learnset;
                        for (let [moveName, learnData] of Object.entries(prevoLearnset)) {
                            if (moveName !== move.id) continue;
                            learnInfo += `**As ${prevo.name}:**\n`;
                            let learnDataToAdd = getLearnData(learnData);
                            if (learnDataToAdd.length > 0) learnsMove = true;
                            learnInfo += learnDataToAdd;
                        };
                        prevo = dexModified.species.get(prevo.prevo);
                    };
                    if (!learnsMove) learnAuthor = `${pokemon.name} does not learn ${move.name}`;
                } else return sendMessage({ client: client, interaction: interaction, content: `I could not find a learnset for ${pokemon.name}.` });
                pokemonEmbed.setTitle(learnAuthor);
                if (learnsMove) pokemonEmbed.setDescription(learnInfo);
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
                    try {
                        let testStringMonth = leadingZeros(month, 2);
                        let testMonth = await axios.get(`https://www.smogon.com/stats/${year}-${testStringMonth}/`);
                    } catch (e) {
                        month = month - 1;
                    };
                };
                if (month < 1) {
                    month += 12;
                    year -= 1;
                };
                let stringMonth = leadingZeros(month, 2);
                // Format URL and other variables
                let searchURL = `https://www.smogon.com/stats/${year}-${stringMonth}/moveset/${formatInput}-${rating}.txt`;
                let response = null;
                let failText = `Could not fetch data for the inputs you provided.\nThe most common reasons for this are spelling mistakes and a lack of Smogon data. If it's early in the month it's possible usage for last month has not been uploaded yet.`;
                let usageButtons = new Discord.ActionRowBuilder()
                    .addComponents(new Discord.ButtonBuilder({ label: 'Showdown Usage', style: Discord.ButtonStyle.Link, url: `https://www.smogon.com/stats/` }))
                    .addComponents(new Discord.ButtonBuilder({ label: 'Showdown Usage (Detailed)', style: Discord.ButtonStyle.Link, url: searchURL }));
                try {
                    response = await axios.get(searchURL);
                    genericUsageResponse = await axios.get(`https://www.smogon.com/stats/${year}-${stringMonth}/${formatInput}-${rating}.txt`);
                } catch (e) {
                    // Make generic embed to guide people to usage statistics :)
                    let replyText = failText;
                    return sendMessage({ client: client, interaction: interaction, content: replyText, components: usageButtons });
                };
                // Filter, split and trim pokemon data
                let usageArray = response.data.replaceAll("|", "").replaceAll("\n", "").trim().split(`----------------------------------------+  +----------------------------------------+`);
                await Object.keys(usageArray).forEach(key => { usageArray[key] = usageArray[key].replaceAll("+", "").replaceAll("--", "") });
                usageArray = usageArray.map(element => element.trim());
                // Variables for generic usage data
                let totalBattleCount = genericUsageResponse.data.split("battles: ")[1].split("Avg.")[0].replace("\n", "").trim();
                let rawUsage = 0;
                let usagePercentage = 0;
                let usageRank = 0;
                let genericDataSplitPokemon = null;
                let pokemonDataSplitLine = null;
                if (pokemonName) {
                    let usagePokemonString = usageArray.find(element => element.startsWith(pokemonName + " ")); // space is to exclude matching more popular subforms
                    if (!usagePokemonString) return sendMessage({ client: client, interaction: interaction, content: `Could not find any data for ${pokemonName} in ${formatInput} during the specified month.`, components: usageButtons });
                    // Data from generic usage page
                    genericDataSplitPokemon = genericUsageResponse.data.split(pokemonName);
                    pokemonDataSplitLine = genericDataSplitPokemon[1].split("|");
                    rawUsage = pokemonDataSplitLine[2].trim();
                    usagePercentage = `${Math.round(pokemonDataSplitLine[1].trim().replace("%", "") * 100) / 100}%`;
                    usageRank = genericDataSplitPokemon[0].split("|");
                    usageRank = usageRank[usageRank.length - 2].trim();
                    // Specific data, .map() is to trim each entry in the array to avoid weird spacing on mobile clients
                    let abilitiesString = usagePokemonString.split("Abilities")[1].split("Items")[0].split("%").map(function (x) { return x.trim(); }).join("%\n").replaceAll("   ", "");
                    let itemsString = usagePokemonString.split("Items")[1].split("Spreads")[0].split("%").map(function (x) { return x.trim(); }).join("%\n").replaceAll("   ", "");
                    let spreadsString = usagePokemonString.split("Spreads")[1].split("Moves")[0].split("%").map(function (x) { return x.trim(); }).join("%\n").replaceAll("   ", "").replaceAll(":", " ");
                    let movesString = usagePokemonString.split("Moves")[1].split("Teammates")[0].split("%").map(function (x) { return x.trim(); }).join("%\n").replaceAll("   ", "");
                    let teammatesString = usagePokemonString.split("Teammates")[1].split("Checks and Counters")[0].split("%").map(function (x) { return x.trim(); }).join("%\n").replaceAll("   ", "");
                    let countersString = usagePokemonString.split("Checks and Counters")[1].split("out)").map(function (x) { return x.trim(); }).join("out)\n").replaceAll("   ", "");
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
                    if (countersString.length > 0) pokemonEmbed.addFields([{ name: "Checks and Counters:", value: countersString, inline: true }]);
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
                    await usageList.forEach(element => { if (usageListPart1.length < 50) usageListPart1.push(element); else if (usageListPart2.length < 50) usageListPart2.push(element) });
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
                    pokemon.num > 0 &&
                    !["CAP"].includes(pokemon.isNonstandard) &&
                    !pokemon.name.endsWith("-Totem") &&
                    !pokemon.name.endsWith("-Tera") && // Ogerpon Tera forms
                    !pokemon.name.startsWith("Arceus-") &&
                    !pokemon.name.startsWith("Silvally-") &&
                    !pokemon.name.startsWith("Genesect-") &&
                    !pokemon.name.startsWith("Gourgeist-") &&
                    !pokemon.name.startsWith("Pumpkaboo-") &&
                    !pokemon.name.startsWith("Squawkabilly-") &&
                    !["Flapple-Gmax", "Appletun-Gmax", "Toxtricity-Gmax", "Toxtricity-Low-Key-Gmax"].includes(pokemon.name)
                );
                let whosThatPokemonMessageObject = await getWhosThatPokemon({ pokemonList: allPokemon });
                returnString = whosThatPokemonMessageObject.content;
                pokemonFiles = whosThatPokemonMessageObject.files;
                pokemonButtons = whosThatPokemonMessageObject.components;
                break;
        };
        // Bulbapedia button
        if (linkBulbapedia) pokemonButtons.addComponents(new Discord.ButtonBuilder({ label: 'More info', style: Discord.ButtonStyle.Link, url: linkBulbapedia }));
        return sendMessage({ client: client, interaction: interaction, content: returnString, embeds: pokemonEmbed, components: pokemonButtons, files: pokemonFiles, ephemeral: ephemeral });

        function getLearnData(learnData) {
            let learnInfo = "";
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
                };
            });
            return learnInfo;
        };

    } catch (e) {
        logger(e, client, interaction);
    };
};

export const config = {
    name: "pokemon",
    description: "Shows Pokémon data.",
    type: Discord.ApplicationCommandOptionType.Subcommand,
    options: [{
        name: "ability",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Get info on an ability.",
        options: [{
            name: "ability",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Ability to get info on.",
            autocomplete: true,
            required: true
        }, {
            name: "generation",
            type: Discord.ApplicationCommandOptionType.Integer,
            description: "Generation to use.",
            minValue: 3,
            maxValue: currentGeneration
        }, {
            name: "ephemeral",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether the reply will be private."
        }]
    }, {
        name: "item",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Get info on an item.",
        options: [{
            name: "item",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Item to get info on.",
            autocomplete: true,
            required: true
        }, {
            name: "generation",
            type: Discord.ApplicationCommandOptionType.Integer,
            description: "Generation to use.",
            minValue: 1,
            maxValue: currentGeneration
        }, {
            name: "ephemeral",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether the reply will be private."
        }]
    }, {
        name: "move",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Get info on a move.",
        options: [{
            name: "move",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Move to get info on.",
            autocomplete: true,
            required: true
        }, {
            name: "generation",
            type: Discord.ApplicationCommandOptionType.Integer,
            description: "Generation to use.",
            minValue: 1,
            maxValue: currentGeneration
        }, {
            name: "ephemeral",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether the reply will be private."
        }]
    }, {
        name: "nature",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Get info on a nature.",
        options: [{
            name: "nature",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Nature to get info on.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether the reply will be private."
        }]
    }, {
        name: "format",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Get info on a format.",
        options: [{
            name: "format",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Format to get info on.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether the reply will be private."
        }]
    }, {
        name: "pokemon",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Get info on a Pokémon.",
        options: [{
            name: "pokemon",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Pokémon to get info on.",
            autocomplete: true,
            required: true
        }, {
            name: "learnset",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether to show the Pokémon's learnset."
        }, {
            name: "shiny",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether to show the Pokémon's shiny sprite."
        }, {
            name: "generation",
            type: Discord.ApplicationCommandOptionType.Integer,
            description: "Generation to use.",
            minValue: 1,
            maxValue: currentGeneration
        }, {
            name: "ephemeral",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether the reply will be private."
        }]
    }, {
        name: "learn",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Check if a Pokémon can learn a move.",
        options: [{
            name: "move",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Move to check availability.",
            autocomplete: true,
            required: true
        }, {
            name: "pokemon",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Pokémon to check availability.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether the reply will be private."
        }]
    }, {
        name: "usage",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Shows Smogon usage data.",
        options: [{
            name: "format",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Format to get data from.",
            autocomplete: true,
            required: true
        }, {
            name: "pokemon",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Pokémon to get data on.",
            autocomplete: true
        }, {
            name: "month",
            type: Discord.ApplicationCommandOptionType.Integer,
            description: "Month (number) to get data from.",
            minValue: 1,
            maxValue: 12
        }, {
            name: "year",
            type: Discord.ApplicationCommandOptionType.Integer,
            description: "Year to get data from.",
            minValue: 2014,
            maxValue: new Date().getFullYear()
        }, {
            name: "rating",
            type: Discord.ApplicationCommandOptionType.Integer,
            description: "Minimum rating to get data from.",
            autocomplete: true,
            minValue: 1000
        }, {
            name: "ephemeral",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether the reply will be private."
        }]
    }, {
        name: "whosthat",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Who's that Pokémon?",
        options: [{
            name: "ephemeral",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether the reply will be private."
        }]
    }]
};