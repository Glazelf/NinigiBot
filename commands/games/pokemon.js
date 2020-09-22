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
                P.getPokemonByName(pokemonName)
                    .then(function (response) {
                        // add pkm embed here
                        console.log(response);

                        pokemonName = capitalizeString(pokemonName);

                        let banner = response.sprites.other["official-artwork"].front_default;
                        if (!banner) banner = response.sprites.front_default;

                        const pkmEmbed = new Discord.MessageEmbed()
                            .setColor(globalVars.embedColor)
                            .setAuthor(`${response.id}: ${pokemonName}`, response.sprites.front_default)
                            .setThumbnail(response.sprites.front_shiny)
                            .addField("Typing:", `a`, true)
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

        function capitalizeString(str) {
            str = str.replace("-", " ");
            var splitStr = str.toLowerCase().split(' ');
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