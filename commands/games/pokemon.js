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
                        return message.channel.send(`> Could not find the specified ability, ${message.author}.`);
                    });
                break;
            case "item":
                P.getItemByName(subArgument)
                    .then(function (response) {
                        // add item embed here
                        return console.log(response);

                    }).catch(function (error) {
                        return message.channel.send(`> Could not find the specified item, ${message.author}.`);
                    });
                break;
            case "move":
                P.getMoveByName(subArgument)
                    .then(function (response) {
                        // add move embed here
                        return console.log(response);

                    }).catch(function (error) {
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
                        return console.log(response);

                    }).catch(function (error) {
                        return message.channel.send(`> Could not find the specified Pokémon, ${message.author}.`);
                    });
                break;
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