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
                        // add ability embed here
                        return console.log(response);

                    }).catch(function (error) {
                        console.log(error)
                        return message.channel.send(`> Could not find the specified ability, ${message.author}.`);
                    });
                break;

            case "item":
                P.getItemByName(subArgument)
                    .then(function (response) {
                        // add item embed here
                        return console.log(response);

                    }).catch(function (error) {
                        console.log(error)
                        return message.channel.send(`> Could not find the specified item, ${message.author}.`);
                    });
                break;

            case "move":
                P.getMoveByName(subArgument)
                    .then(function (response) {
                        // add move embed here
                        return console.log(response);

                    }).catch(function (error) {
                        console.log(error)
                        return message.channel.send(`> Could not find the specified move, ${message.author}.`);
                    });
                break;

            default:
                let pokemonName = subCommand;
                if (pokemonName == "tapu" && args[2]) pokemonName = `${args[1]}-${args[2]}`;
                if (pokemonName == "type:" && args[2]) pokemonName = `${args[1].substring(0, args[1].length - 1)}-${args[2]}`;
                // "joke" name aliases
                if (pokemonName == "smogonbird") pokemonName = "talonflame";
                if (pokemonName == "glaze") pokemonName = "shinx";
                if (pokemonName == "joris") pokemonName = "charjabug";

                P.getPokemonByName(pokemonName)
                    .then(async function (response) {
                        // add pkm embed here
                        console.log(response);

                        let typeString = "";
                        let type1 = response.types[0].type.name;
                        if (response.types[1]) {
                            let type2 = response.types[1].type.name;
                            typeString = getTypeEmotes(type1, type2);
                        } else {
                            typeString = getTypeEmotes(type1);
                        };

                        var pokemonID = leadingZeros(response.id.toString());
                        if (pokemonName.endsWith("alola")) {
                            let baseName = pokemonName.substring(0, pokemonName.length - 6);
                            await P.getPokemonByName(baseName)
                                .then(function (responseAlola) {
                                    let AlolaID = leadingZeros(responseAlola.id.toString());
                                    pokemonID = `${AlolaID}-a`;
                                });
                        };
                        pokemonName = capitalizeString(pokemonName);
                        let banner = `https://www.serebii.net/pokemon/art/${pokemonID}.png`;
                        let spriteShiny = `https://www.serebii.net/Shiny/SWSH/${pokemonID}.png`;
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
                        let abilityStringCapitalized = capitalizeAbilities(abilityString);

                        const pkmEmbed = new Discord.MessageEmbed()
                            .setColor(globalVars.embedColor)
                            .setAuthor(`${pokemonID}: ${pokemonName}`, banner)
                            .setThumbnail(spriteShiny)
                            .addField("Typing:", typeString, false)
                        if (abilityString.length > 0) pkmEmbed.addField("Abilities:", abilityStringCapitalized, false)
                        pkmEmbed
                            .addField("Stats:", `HP: ${response.stats[0].base_stat}
Attack: ${response.stats[1].base_stat}
Defense: ${response.stats[2].base_stat}
Sp. Attack: ${response.stats[3].base_stat}
Sp. Defense: ${response.stats[4].base_stat}
Speed: ${response.stats[5].base_stat}`, false)
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
            let typeEmoteArray = [
                {
                    "typeName": "normal",
                    "typeEmote": "<:normal:758002386189942854>"
                },
                {
                    "typeName": "fire",
                    "typeEmote": "<:normal:758002386189942854>"
                },
                {
                    "typeName": "fighting",
                    "typeEmote": "<:fighting:758002386370560041>"
                },
                {
                    "typeName": "water",
                    "typeEmote": "<:water:758002386110513183>"
                },
                {
                    "typeName": "flying",
                    "typeEmote": "<:flying:758002385879564380>"
                },
                {
                    "typeName": "grass",
                    "typeEmote": "<:grass:758002386081153104>"
                },
                {
                    "typeName": "poison",
                    "typeEmote": "<:poison:758002386148130886>"
                },
                {
                    "typeName": "electric",
                    "typeEmote": "<:electric:758002386165039114>"
                },
                {
                    "typeName": "ground",
                    "typeEmote": "<:ground:758002386035015890>"
                },
                {
                    "typeName": "psychic",
                    "typeEmote": "<:psychic:758002386026627163>"
                },
                {
                    "typeName": "rock",
                    "typeEmote": "<:rock:758002386047598612>"
                },
                {
                    "typeName": "ice",
                    "typeEmote": "<:ice:758002385909186561>"
                },
                {
                    "typeName": "bug",
                    "typeEmote": "<:bug:758002386005655632>"
                },
                {
                    "typeName": "dragon",
                    "typeEmote": "<:dragon:758002386496127016>"
                },
                {
                    "typeName": "ghost",
                    "typeEmote": "<:ghost:758002386047467570>"
                },
                {
                    "typeName": "dark",
                    "typeEmote": "<:dark:758002385829363798>"
                },
                {
                    "typeName": "steel",
                    "typeEmote": "<:steel:758008473211502673>"
                },
                {
                    "typeName": "fairy",
                    "typeEmote": "<:fairy:758002386114707597>"
                }
            ];
            console.log(type1)
            let type1Emote = typeEmoteArray.find(type => type.typeName == type1).typeEmote;
            let type1Name = capitalizeString(type1);
            let typeString = `${type1Emote} ${type1Name}`;
            if (type2) {
                type2Emote = typeEmoteArray.find(type => type.typeName == type2).typeEmote;
                type2Name = capitalizeString(type2);
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

        function capitalizeString(str) {
            str = str.replace("-", " ");
            var splitStr = str.split(' ');
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