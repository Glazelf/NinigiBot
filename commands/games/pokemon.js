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
                            .setFooter(`Requested by ${message.author.tag}`)
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
                            .addField("Category:", capitalizeString(response.category.name), false)
                            .addField("Description:", response.effect_entries[0].short_effect, false)
                            .setFooter(`Requested by ${message.author.tag}`)
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
                            .addField("Type:", getTypeEmotes(response.type.name), false)
                            .addField("Category:", capitalizeString(response.damage_class.name), true)
                        if (response.power) moveEmbed.addField("Power:", response.power, true)
                        if (response.accuracy) moveEmbed.addField("Accuracy:", response.accuracy, true)
                        if (response.priority !== 0) moveEmbed.addField("Priority:", response.priority, true)
                        moveEmbed
                            .addField("Target:", capitalizeString(response.target.name), false)
                            .addField("Description:", response.effect_entries[0].effect, false)
                            .setFooter(`Requested by ${message.author.tag}`)
                            .setTimestamp();

                        return message.channel.send(moveEmbed);

                    }).catch(function (error) {
                        console.log(error);
                        return message.channel.send(`> Could not find the specified move, ${message.author}.`);
                    });
                break;

            default:
                let pokemonName = subCommand;
                if (pokemonName == "tapu" && args[2]) pokemonName = `${args[1]}-${args[2]}`;
                if (pokemonName == "type:" && args[2]) pokemonName = `${args[1].substring(0, args[1].length - 1)}-${args[2]}`;
                // edgecase name corrections
                if (pokemonName == "farfetch'd") pokemonName = "farfetchd";
                if (pokemonName == "deoxys") pokemonName = "deoxys-normal";
                if (pokemonName == "giratina") pokemonName = "giratina-altered";
                if (pokemonName == "tornadus") pokemonName = "tornadus-incarnate";
                if (pokemonName == "thundurus") pokemonName = "thundurus-incarnate";
                if (pokemonName == "landorus") pokemonName = "landorus-incarnate";
                if (pokemonName == "keldeo") pokemonName = "keldeo-ordinary";
                if (pokemonName == "zygarde-50") pokemonName = "zygarde";
                if (pokemonName == "rockruff-dusk") pokemonName = "rockruff-own-tempo";
                if (pokemonName == "lycanroc") pokemonName = "lycanroc-midday";
                if (pokemonName == "mimikyu") pokemonName = "mimikyu-disguised";
                if (pokemonName == "necrozma-dawn-wings") pokemonName = "necrozma-dawn";
                if (pokemonName == "necrozma-dusk-mane") pokemonName = "necrozma-dusk";
                // "joke" name aliases
                if (pokemonName == "smogonbird") pokemonName = "talonflame";
                if (pokemonName == "glaze") pokemonName = "shinx";
                if (pokemonName == "joris") pokemonName = "charjabug";
                if (pokemonName == "zora") pokemonName = "turtwig";

                P.getPokemonByName(pokemonName)
                    .then(async function (response) {
                        // Log for testing, remove later
                        console.log(response);

                        // Typing
                        let typeString = "";
                        let type1 = response.types[0].type.name;
                        if (response.types[1]) {
                            let type2 = response.types[1].type.name;
                            typeString = getTypeEmotes(type1, type2);
                        } else {
                            typeString = getTypeEmotes(type1);
                        };

                        // Typing matchups
                        let normalWeak = ["fighting"];
                        let normalRes =  [];
                        let normalImmune = ["ghost"];


                        // Metrics
                        let weight = `${response.weight / 10}kg`;
                        let height = `${response.height / 10}m`;

                        var pokemonID = leadingZeros(response.id.toString());
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

                        const alolaString = "-alola";
                        const megaString = "-mega";
                        const primalString = "-primal";
                        const alolaBool = pokemonName.endsWith(alolaString);
                        const megaBool = pokemonName.endsWith(megaString);
                        const primalBool = pokemonName.endsWith(primalString);
                        let formLength;

                        // Catch other forms
                        if (alolaBool) {
                            formLength = alolaString.length;
                            let baseName = pokemonName.substring(0, pokemonName.length - formLength);
                            await P.getPokemonByName(baseName)
                                .then(function (responseAlola) {
                                    let AlolaID = leadingZeros(responseAlola.id.toString());
                                    pokemonID = `${AlolaID}-a`;
                                })
                                .catch(function (error) {
                                    console.log(error)
                                    return message.channel.send(`> Could not find the specified Pokémon, ${message.author}.`);
                                });
                        };
                        if (megaBool || primalBool) {
                            if (megaBool) formLength = megaString.length;
                            if (primalBool) formLength = primalString.length;
                            let baseName = pokemonName.substring(0, pokemonName.length - formLength);
                            await P.getPokemonByName(baseName)
                                .then(function (responseMega) {
                                    let MegaID = leadingZeros(responseMega.id.toString());
                                    pokemonID = `${MegaID}-m`;
                                })
                                .catch(function (error) {
                                    console.log(error)
                                    return message.channel.send(`> Could not find the specified Pokémon, ${message.author}.`);
                                });
                        };

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

                        // Simplify pokemonNames 
                        if (pokemonName == "mimikyu-disguised") pokemonName = "mimikyu";
                        if (pokemonName == "mimikyu-busted") pokemonName = "mimikyu";

                        pokemonName = capitalizeString(pokemonName);
                        let abilityStringCapitalized = capitalizeAbilities(abilityString);

                        const pkmEmbed = new Discord.MessageEmbed()
                            .setColor(globalVars.embedColor)
                            .setAuthor(`${pokemonID.toUpperCase()}: ${pokemonName}`, icon)
                            .setThumbnail(sprite)
                            .addField("Type:", typeString, true)
                            .addField("Metrics:", `Weight: ${weight}
Height: ${height}`, true)
                        if (abilityString.length > 0) pkmEmbed.addField("Abilities:", abilityStringCapitalized, false)
                        pkmEmbed
                            .addField("Stats: (50) (100)", `HP: **${baseHP}** ${HPstats}
Atk: **${baseAtk}** ${Atkstats}
Def: **${baseDef}** ${Defstats}
SpA: **${baseSpA}** ${SpAstats}
SpD: **${baseSpD}** ${SpDstats}
Spe: **${baseSpe}** ${Spestats}
BST: ${BST}`, false)
                            .setImage(banner)
                            .setFooter(`Requested by ${message.author.tag}`)
                            .setTimestamp();

                        return message.channel.send(pkmEmbed)

                    }).catch(function (error) {
                        console.log(error)
                        return message.channel.send(`> Could not find the specified Pokémon, ${message.author}.`);
                    });
                break;
        };

        function getTypeEmotes(type1, type2) {
            const typeEmoteList = require('../../objects/pokemon/typeEmotes.json');
            let type1Emote = typeEmoteList[type1];
            let type1Name = capitalizeString(type1);
            let typeString = `${type1Emote} ${type1Name}`;
            if (type2) {
                let type2Emote = typeEmoteList[type2];
                let type2Name = capitalizeString(type2);
                typeString = `${typeString} / ${type2Emote} ${type2Name}`;
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