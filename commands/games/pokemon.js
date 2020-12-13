module.exports.run = async (client, message) => {
    let globalVars = require('../../events/ready');
    try {
        const Discord = require("discord.js");
        var Pokedex = require('pokedex-promise-v2');
        var P = new Pokedex();

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
                        const moveEmbed = new Discord.MessageEmbed()
                            .setColor(globalVars.embedColor)
                            .setAuthor(capitalizeString(response.name))
                            .addField("Type:", getTypeEmotes(response.type.name), true)
                            .addField("Category:", capitalizeString(response.damage_class.name), true);
                        if (response.power) moveEmbed.addField("Power:", response.power, true);
                        if (response.accuracy) moveEmbed.addField("Accuracy:", response.accuracy, true);
                        if (response.priority !== 0) moveEmbed.addField("Priority:", response.priority, true);
                        moveEmbed
                            .addField("Target:", capitalizeString(response.target.name), true)
                            .addField("Description:", response.effect_entries[0].effect, false)
                            .setFooter(message.author.tag)
                            .setTimestamp();

                        return message.channel.send(moveEmbed);

                    }).catch(function (error) {
                        console.log(error);
                        return message.channel.send(`> Could not find the specified move, ${message.author}.`);
                    });
                break;

            default:
                var pokemonName = subCommand;
                args.forEach(arg => {
                    if (arg !== args[0] && arg !== args[1]) {
                        pokemonName = `${pokemonName} ${arg}`;
                    };
                });

                if (pokemonName.startsWith("tapu") || pokemonName == "type null") pokemonName = `${args[1]}-${args[2]}`;
                if (pokemonName == "type: null") pokemonName = `${args[1].substring(0, args[1].length - 1)}-${args[2]}`;
                // edgecase name corrections
                if (pokemonName == "farfetch'd") pokemonName = "farfetchd";
                if (pokemonName == "mime jr") pokemonName = "mime-jr";
                if (pokemonName == "mr mime" || pokemonName == "mr. mime") pokemonName = "mr-mime";
                if (pokemonName == "deoxys") pokemonName = "deoxys-normal";
                if (pokemonName == "giratina") pokemonName = "giratina-altered";
                if (pokemonName == "darmanitan") pokemonName = "darmanitan-standard";
                if (pokemonName == "darmanitan-galar") pokemonName = "darmanitan-standard-galar";
                if (pokemonName == "darmanitan-galar-zen") pokemonName = "darmanitan-zen-galar";
                if (pokemonName == "tornadus") pokemonName = "tornadus-incarnate";
                if (pokemonName == "thundurus") pokemonName = "thundurus-incarnate";
                if (pokemonName == "landorus") pokemonName = "landorus-incarnate";
                if (pokemonName == "keldeo") pokemonName = "keldeo-ordinary";
                if (pokemonName == "zygarde-10%") pokemonName = "zygarde-10";
                if (pokemonName == "zygarde-50" || pokemonName == "zygarde-50%") pokemonName = "zygarde";
                if (pokemonName == "zygarde-100" || pokemonName == "zygarde-100%") pokemonName = "zygarde-complete";
                if (pokemonName == "rockruff-dusk") pokemonName = "rockruff-own-tempo";
                if (pokemonName == "lycanroc") pokemonName = "lycanroc-midday";
                if (pokemonName == "mimikyu") pokemonName = "mimikyu-disguised";
                if (pokemonName == "necrozma-dawn-wings") pokemonName = "necrozma-dawn";
                if (pokemonName == "necrozma-dusk-mane") pokemonName = "necrozma-dusk";
                if (pokemonName == "zacian") pokemonName = "zacian-hero";
                if (pokemonName == "zamazenta") pokemonName = "zamazenta-hero";
                if (pokemonName == "calyrex-ice") pokemonName = "calyrex-ice-rider";
                if (pokemonName == "calyrex-shadow") pokemonName = "calyrex-shadow-rider";
                // "joke" name aliases
                if (pokemonName == "smogonbird") pokemonName = "talonflame";
                if (pokemonName == "glaze") pokemonName = "shinx";
                if (pokemonName == "joris") pokemonName = "charjabug";
                if (pokemonName == "zora") pokemonName = "turtwig";

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

                        // Typing matchups
                        let types = {
                            "normal": { se: [], res: ["rock", "steel"], immune: ["ghost"], effect: 0 },
                            "fighting": { se: ["normal", "rock", "steel", "ice", "dark"], res: ["flying", "poison", "bug", "psychic", "fairy"], immune: ["ghost"], effect: 0 },
                            "flying": { se: ["fighting", "bug", "grass"], res: ["rock", "steel", "electric"], immune: [], effect: 0 },
                            "poison": { se: ["grass", "fairy"], res: ["poison", "ground", "rock", "ghost"], immune: ["steel"], effect: 0 },
                            "ground": { se: ["poison", "rock", "steel", "fire", "electric"], res: ["bug", "grass"], immune: ["flying"], effect: 0 },
                            "rock": { se: ["flying", "bug", "fire", "ice"], res: ["fighting", "ground", "steel"], immune: [], effect: 0 },
                            "bug": { se: ["grass", "psychic", "dark"], res: ["fighting", "flying", "poison", "ghost", "steel", "fire", "fairy"], immune: [], effect: 0 },
                            "ghost": { se: ["ghost", "psychic"], res: ["dark"], immune: ["normal"], effect: 0 },
                            "steel": { se: ["rock", "ice", "fairy"], res: ["steel", "fire", "water", "electric"], immune: [], effect: 0 },
                            "fire": { se: ["bug", "steel", "grass", "ice"], res: ["rock", "fire", "water", "dragon"], immune: [], effect: 0 },
                            "water": { se: ["ground", "rock", "fire"], res: ["water", "grass", "dragon"], immune: [], effect: 0 },
                            "grass": { se: ["ground", "rock", "water"], res: ["flying", "poison", "bug", "steel", "fire", "grass", "dragon"], immune: [], effect: 0 },
                            "electric": { se: ["flying", "water"], res: ["grass", "electric", "dragon"], immune: ["ground"], effect: 0 },
                            "psychic": { se: ["fighting", "poison"], res: ["steel", "psychic"], immune: ["dark"], effect: 0 },
                            "ice": { se: ["flying", "ground", "grass", "dragon"], res: ["steel", "fire", "water", "ice"], immune: [], effect: 0 },
                            "dragon": { se: ["dragon"], res: ["steel"], immune: ["fairy"], effect: 0 },
                            "dark": { se: ["ghost", "psychic"], res: ["fighting", "dark", "fairy"], immune: [], effect: 0 },
                            "fairy": { se: ["fighting", "dragon", "dark"], res: ["poison", "steel", "fire"], immune: [], effect: 0 }
                        };

                        let superEffectives = "";
                        let resistances = "";
                        let immunities = "";

                        // Check type matchups
                        for (let [key, type] of Object.entries(types)) {
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

                        var pokemonID = leadingZeros(response.id.toString());

                        const alolaString = "-alola";
                        const galarString = "-galar";
                        const megaString = "-mega";
                        const primalString = "-primal";
                        const alolaBool = pokemonName.endsWith(alolaString);
                        const galarBool = pokemonName.endsWith(galarString);
                        const megaBool = pokemonName.endsWith(megaString);
                        const primalBool = pokemonName.endsWith(primalString);
                        let regionalChar;

                        // Catch other forms
                        if (alolaBool || galarBool) {
                            if (alolaBool) {
                                formLength = alolaString.length;
                                regionalChar = "-a";
                            };
                            if (galarBool) {
                                formLength = galarString.length;
                                regionalChar = "-g";
                            };
                            let baseName = pokemonName.replace("-galar", "").replace("-alola", "");
                            await P.getPokemonByName(baseName)
                                .then(function (responseRegional) {
                                    let RegionalID = leadingZeros(responseRegional.id.toString());
                                    pokemonID = `${RegionalID}${regionalChar}`;
                                })
                                .catch(function (error) {
                                    console.log(error);
                                    return message.channel.send(`> Could not find the specified Pokémon, ${message.author}.`);
                                });
                        };
                        if (megaBool || primalBool) {
                            if (megaBool) formLength = megaString.length;
                            if (primalBool) formLength = primalString.length;
                            let baseName = pokemonName.replace("-mega", "").replace("-primal", "");
                            await P.getPokemonByName(baseName)
                                .then(function (responseMega) {
                                    let MegaID = leadingZeros(responseMega.id.toString());
                                    pokemonID = `${MegaID}-m`;
                                })
                                .catch(function (error) {
                                    console.log(error);
                                    return message.channel.send(`> Could not find the specified Pokémon, ${message.author}.`);
                                });
                        };

                        // edgecase ID corrections, should be put in a JSON sometime. Delta is a nerd.
                        if (pokemonName == "charizard-mega-x") pokemonID = "006-mx";
                        if (pokemonName == "charizard-mega-y") pokemonID = "006-my";
                        if (pokemonName == "mewtwo-mega-x") pokemonID = "150-mx";
                        if (pokemonName == "mewtwo-mega-y") pokemonID = "150-my";
                        if (pokemonName == "castform-sunny") pokemonID = "351-s";
                        if (pokemonName == "castform-rainy") pokemonID = "351-r";
                        if (pokemonName == "castform-snowy") pokemonID = "351-i";
                        if (pokemonName == "deoxys-attack") pokemonID = "386-a";
                        if (pokemonName == "deoxys-defense") pokemonID = "386-d";
                        if (pokemonName == "deoxys-speed") pokemonID = "386-s";
                        if (pokemonName == "rotom-fan") pokemonID = "479-s";
                        if (pokemonName == "rotom-frost") pokemonID = "479-f";
                        if (pokemonName == "rotom-heat") pokemonID = "479-h";
                        if (pokemonName == "rotom-mow") pokemonID = "479-m";
                        if (pokemonName == "rotom-wash") pokemonID = "479-w";
                        if (pokemonName == "giratina-origin") pokemonID = "487-o";
                        if (pokemonName == "shaymin-sky") pokemonID = "492-s";
                        if (pokemonName == "darmanitan-zen") pokemonID = "555-z";
                        if (pokemonName == "darmanitan-zen-galar") pokemonID = "555-gz";
                        if (pokemonName == "tornadus-therian") pokemonID = "641-s";
                        if (pokemonName == "thundurus-therian") pokemonID = "642-s";
                        if (pokemonName == "landorus-therian") pokemonID = "645-s";
                        if (pokemonName == "kyurem-black") pokemonID = "646-b";
                        if (pokemonName == "kyurem-white") pokemonID = "646-w";
                        if (pokemonName == "keldeo-resolute") pokemonID = "647-r";
                        if (pokemonName == "zygarde-10") pokemonID = "718-10";
                        if (pokemonName == "zygarde-complete") pokemonID = "718-c";
                        if (pokemonName == "hoopa-unbound") pokemonID = "720-u";
                        if (pokemonName == "rockruff-own-tempo") pokemonID = "744";
                        if (pokemonName == "lycanroc-midnight") pokemonID = "745-m";
                        if (pokemonName == "lycanroc-dusk") pokemonID = "745-d";
                        if (pokemonName == "mimikyu-busted") pokemonID = "778";
                        if (pokemonName == "necrozma-dawn") pokemonID = "800-dw";
                        if (pokemonName == "necrozma-dusk") pokemonID = "800-dm";
                        if (pokemonName == "necrozma-ultra") pokemonID = "800-m";
                        if (pokemonName == "zacian-crowned") pokemonID = "888-c";
                        if (pokemonName == "zamazenta-crowned") pokemonID = "889-c";
                        if (pokemonName == "calyrex-ice-rider") pokemonID = "898-i";
                        if (pokemonName == "calyrex-shadow-rider") pokemonID = "898-s";

                        let banner = `https://www.serebii.net/pokemon/art/${pokemonID}.png`;

                        // Shuffle icons, only works for pokemon in pokemon shuffle
                        let icon = `https://www.pkparaiso.com/imagenes/shuffle/sprites/${pokemonID}.png`;
                        // Lower res party sprites from smogon, but work for all pokemon (but different naming convention, fuck smogon)
                        //let icon = `https://www.smogon.com/forums//media/minisprites/${pokemonName}.png`;

                        // High rest gen 8 sprite but only works for pokemon in swsh
                        let sprite = `https://www.serebii.net/Shiny/SWSH/${pokemonID}.png`;
                        // Lower Res sprite but works for all pokemon (but different naming convention, fuck smogon)
                        //let sprite = `https://play.pokemonshowdown.com/sprites/ani-shiny/${pokemonName}.gif`;

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

                        // Stat ranges
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
                        if (pokemonName == "darmanitan-standard") pokemonName = "darmanitan";
                        if (pokemonName == "darmanitan-standard-galar") pokemonName = "darmanitan-galar";
                        if (pokemonName == "mimikyu-disguised") pokemonName = "mimikyu";
                        if (pokemonName == "mimikyu-busted") pokemonName = "mimikyu";
                        if (pokemonName == "necrozma-dusk") pokemonName = "necrozma-dusk-mane";
                        if (pokemonName == "necrozma-dawn") pokemonName = "necrozma-dawn-wings";

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
                            .addField("Stats: (50) (100)", `HP: **${baseHP}** ${HPstats}
Atk: **${baseAtk}** ${Atkstats}
Def: **${baseDef}** ${Defstats}
SpA: **${baseSpA}** ${SpAstats}
SpD: **${baseSpD}** ${SpDstats}
Spe: **${baseSpe}** ${Spestats}
BST: ${BST}`, false)
                            .setImage(banner)
                            .setFooter(message.author.tag)
                            .setTimestamp();

                        return message.channel.send(pkmEmbed)

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

        function capitalizeAbilities(str) {
            let abilitySplit = str.split('\n');
            let newArray = [];
            for (var i = 0; i < abilitySplit.length; i++) {
                newArray.push(capitalizeString(abilitySplit[i]));
            };
            capitalizedAbilities = newArray.join('\n');
            return capitalizedAbilities;
        };

        function calcHP(base) {
            let min50 = Math.floor((((2 * base) * 50) / 100) + 50 + 10);
            let max50 = Math.floor((((2 * base + 31 + (252 / 4)) * 50) / 100) + 50 + 10);
            let min100 = Math.floor((((2 * base) * 100) / 100) + 100 + 10);
            let max100 = Math.floor((((2 * base + 31 + (252 / 4)) * 100) / 100) + 100 + 10);

            let StatText = `(${min50}-${max50}) (${min100}-${max100})`;
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

        function leadingZeros(str) {
            for (var i = str.length; i < 3; i++) {
                str = "0" + str;
            };
            return str;
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