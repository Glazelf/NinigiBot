module.exports.run = async (client, message) => {
    let globalVars = require('../../events/ready');
    try {
        const Discord = require("discord.js");
        const fetch = require("node-fetch");
        var Pokedex = require('pokedex-promise-v2');
        var P = new Pokedex();
        const correctionDisplay = require('../../objects/pokemon/correctionDisplay.json');
        const correctionID = require('../../objects/pokemon/correctionID.json');
        const correctionName = require('../../objects/pokemon/correctionName.json');
        const easterEggName = require('../../objects/pokemon/easterEggName.json');
        const typeMatchups = require('../../objects/pokemon/typeMatchups.json');

        if (!message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")) return message.channel.send(`> I don't have permissions to embed messages, ${message.author}.`);

        const args = message.content.split(' ');
        if (!args[1]) return message.channel.send(`> You need to provide either a subcommand or a Pokémon to look up, ${message.author}.`);

        let subCommand = args[1].toLowerCase();
        let subArgument = message.content.substring(message.content.indexOf(subCommand) + subCommand.length + 1, message.content.length).toLowerCase();
        subArgument = subArgument.replace(" ", "-");

        switch (subCommand) {
            case "ability":
                P.getAbilityByName(subArgument)
                    .then(function (response) {
                        // Why are german entries still tagged as English?
                        // let englishEntry = response.effect_entries.find(element => element.language.name = "en");
                        // English entries always seem to be either the only or the last entry, so this should work. For now.
                        let englishEntry = response.effect_entries[response.effect_entries.length - 1];
                        const abilityEmbed = new Discord.MessageEmbed()
                            .setColor(globalVars.embedColor)
                            .setAuthor(capitalizeString(response.name))
                            .addField("Description:", englishEntry.short_effect, false)
                            .setFooter(message.author.tag)
                            .setTimestamp();

                        return message.channel.send(abilityEmbed);

                    }).catch(function (error) {
                        console.log(error);
                        return message.channel.send(`> Could not find the specified ability, ${message.author}.`);
                    });
                break;

            case "item":
                P.getItemByName(subArgument)
                    .then(function (response) {
                        const itemEmbed = new Discord.MessageEmbed()
                            .setColor(globalVars.embedColor)
                            .setAuthor(capitalizeString(response.name))
                            .setThumbnail(response.sprites.default)
                            .addField("Category:", capitalizeString(response.category.name), true)
                            .addField("Description:", response.effect_entries[0].short_effect, false)
                            .setFooter(message.author.tag)
                            .setTimestamp();

                        return message.channel.send(itemEmbed);

                    }).catch(function (error) {
                        console.log(error);
                        return message.channel.send(`> Could not find the specified item, ${message.author}.`);
                    });
                break;

            case "move":
                P.getMoveByName(subArgument)
                    .then(function (response) {
                        let description = response.effect_entries[0].short_effect.replace("$effect_chance", response.effect_chance);

                        const moveEmbed = new Discord.MessageEmbed()
                            .setColor(globalVars.embedColor)
                            .setAuthor(capitalizeString(response.name))
                            .addField("Type:", getTypeEmotes(response.type.name), true)
                            .addField("Category:", capitalizeString(response.damage_class.name), true);
                        if (response.power) moveEmbed.addField("Power:", response.power, true);
                        if (response.accuracy) moveEmbed.addField("Accuracy:", `${response.accuracy}%`, true);
                        if (response.priority !== 0) moveEmbed.addField("Priority:", response.priority, true);
                        moveEmbed
                            .addField("Target:", capitalizeString(response.target.name), true)
                            .addField("Description:", description, false)
                            .setFooter(message.author.tag)
                            .setTimestamp();

                        return message.channel.send(moveEmbed);

                    }).catch(function (error) {
                        console.log(error);
                        return message.channel.send(`> Could not find the specified move, ${message.author}.`);
                    });
                break;

            default:
                // Public variables
                var pokemonName = subCommand;
                var pokemonID;

                args.forEach(arg => {
                    if (arg !== args[0] && arg !== args[1]) {
                        pokemonName = `${pokemonName} ${arg}`;
                    };
                });

                // Edgecase name corrections
                if (pokemonName.startsWith("tapu") || pokemonName == "type null") pokemonName = `${args[1]}-${args[2]}`;
                if (pokemonName == "type: null") pokemonName = `${args[1].substring(0, args[1].length - 1)}-${args[2]}`;
                correctValue(correctionName, pokemonName);

                // Easter egg name aliases
                correctValue(easterEggName, pokemonName);

                P.getPokemonByName(pokemonName)
                    .then(async function (response) {
                        // Log for testing, remove later
                        // console.log(response);

                        // Correct name when searching by ID
                        pokemonName = response.name;

                        // Typing
                        let typeString = "";
                        let type1 = response.types[0].type.name;
                        if (response.types[1]) {
                            var type2 = response.types[1].type.name;
                            typeString = getTypeEmotes(type1, type2);
                        } else {
                            typeString = getTypeEmotes(type1);
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
                                    typeName = getTypeEmotes(typeName, null, true);
                                } else {
                                    typeName = getTypeEmotes(typeName);
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
                                        superEffectives = getTypeEmotes(typeName);
                                    } else {
                                        superEffectives = `${superEffectives}, ${getTypeEmotes(typeName)}`;
                                    };
                                };
                                if (type.res.includes(type1)) {
                                    if (resistances.length == 0) {
                                        resistances = getTypeEmotes(typeName);
                                    } else {
                                        resistances = `${resistances}, ${getTypeEmotes(typeName)}`;
                                    };
                                };
                                if (type.immune.includes(type1)) {
                                    if (immunities.length == 0) {
                                        immunities = getTypeEmotes(typeName);
                                    } else {
                                        immunities = `${immunities}, ${getTypeEmotes(typeName)}`;
                                    };
                                };
                            };
                        };

                        // Metrics
                        let weight = `${response.weight / 10}kg`;
                        let height = `${response.height / 10}m`;

                        pokemonID = leadingZeros(response.id.toString());

                        // Forms
                        const alolaString = "-alola";
                        const galarString = "-galar";
                        const megaString = "-mega";
                        const primalString = "-primal";
                        const gmaxString = "-gmax";
                        const alolaBool = pokemonName.endsWith(alolaString);
                        const galarBool = pokemonName.endsWith(galarString);
                        const megaBool = pokemonName.endsWith(megaString);
                        const primalBool = pokemonName.endsWith(primalString);
                        const gmaxBool = pokemonName.endsWith(gmaxString);
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
                                weight = "???kg";
                            };
                            let baseName = pokemonName.replace("-alola", "").replace("-galar", "").replace("-mega", "").replace("-primal", "").replace("-gmax", "");
                            await P.getPokemonByName(baseName)
                                .then(function (responseForm) {
                                    let formID = leadingZeros(responseForm.id.toString());
                                    pokemonID = `${formID}${formChar}`;
                                })
                                .catch(function (error) {
                                    console.log(error);
                                    return message.channel.send(`> Could not find the specified Pokémon, ${message.author}.`);
                                });
                        };

                        // edgecase ID corrections, should be put in a JSON sometime. Delta is a nerd.
                        correctValue(correctionID, pokemonID);

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
                        correctValue(correctionDisplay, pokemonName);

                        pokemonName = capitalizeString(pokemonName);
                        let abilityStringCapitalized = capitalizeAbilities(abilityString);

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
                            .setFooter(message.author.tag)
                            .setTimestamp();

                        return message.channel.send(pkmEmbed);

                    }).catch(function (error) {
                        console.log(error);
                        return message.channel.send(`> Could not find the specified Pokémon, ${message.author}.`);
                    });
                break;
        };

        function getTypeEmotes(type1, type2, bold) {
            const typeEmoteList = require('../../objects/pokemon/typeEmotes.json');
            let type1Emote = typeEmoteList[type1];
            let type1Name = capitalizeString(type1);
            if (bold == true) type1Name = `**${type1Name}**`;
            let typeString = `${type1Emote} ${type1Name}`;
            if (type2) {
                let type2Emote = typeEmoteList[type2];
                let type2Name = capitalizeString(type2);
                if (bold == true) type2Name = `**${type2Name}**`;
                typeString = `${typeString}
${type2Emote} ${type2Name}`;
            };
            return typeString;
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

        function calcHP(base) {
            let min50 = Math.floor((((2 * base) * 50) / 100) + 50 + 10);
            let max50 = Math.floor((((2 * base + 31 + (252 / 4)) * 50) / 100) + 50 + 10);
            let min100 = Math.floor((((2 * base) * 100) / 100) + 100 + 10);
            let max100 = Math.floor((((2 * base + 31 + (252 / 4)) * 100) / 100) + 100 + 10);
            let StatText = `(${min50}-${max50}) (${min100}-${max100})`;
            if (pokemonName.endsWith("-gmax") || pokemonName.endsWith("-eternamax")) StatText = `(${min50 * 1.5}-${max50 * 2}) (${min100 * 1.5}-${max100 * 2})`;
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

        function capitalizeString(str) {
            var splitStr = str.split('-');
            for (var i = 0; i < splitStr.length; i++) {
                // You do not need to check if i is larger than splitStr length, as your for does that for you
                // Assign it back to the array
                splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
            };
            // Return the joined string
            returnStr = splitStr.join(' ');
            if (returnStr == "Type Null") returnStr = "Type: Null";
            return returnStr;
        };

        function capitalizeAbilities(str) {
            let abilitySplit = str.split('\n');
            let newArray = [];
            for (var i = 0; i < abilitySplit.length; i++) {
                newArray.push(capitalizeString(abilitySplit[i]));
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
    aliases: ["pkm", "pkmn"]
};