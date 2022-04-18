exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const { Dex } = require('pokemon-showdown');
        const correctionName = require('../../objects/pokemon/correctionName.json');
        const easterEggName = require('../../objects/pokemon/easterEggName.json');
        const getPokemon = require('../../util/pokemon/getPokemon');
        const getTypeEmotes = require('../../util/pokemon/getTypeEmotes');
        const capitalizeString = require('../../util/capitalizeString');
        const randomNumber = require('../../util/randomNumber');

        if (!args[0]) return sendMessage({ client: client, message: message, content: `You need to provide either a subcommand or a Pokémon to look up.` });

        let subCommand = args[0].toLowerCase();
        let subArgument;
        if (args[1]) subArgument = args.slice(1).join("-").replace(" ", "-").toLowerCase();

        let pokemonEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setFooter({ text: message.member.user.tag })
            .setTimestamp();

        let pokemonButtons = new Discord.MessageActionRow();
        let nameBulbapedia = null;
        let linkBulbapedia = null;

        switch (subCommand) {
            // Abilities
            case "ability":
                let ability = Dex.abilities.get(subArgument);
                if (!ability) return sendMessage({ client: client, message: message, content: `Sorry, I could not find an ability by that name.` });

                nameBulbapedia = ability.name.replaceAll(" ", "_");
                linkBulbapedia = `https://bulbapedia.bulbagarden.net/wiki/${nameBulbapedia}_(${ability.effectType})`;

                pokemonEmbed
                    .setAuthor({ name: `${ability.name} (${ability.effectType})` })
                    .setDescription(ability.desc)
                    .addField("Introduced:", `Gen ${ability.gen}`, false);
                break;

            // Items
            case "item":
                let item = Dex.items.get(subArgument);
                if (!item) return sendMessage({ client: client, message: message, content: `Sorry, I could not find an item by that name.` });
                let itemImage = `https://www.serebii.net/itemdex/sprites/pgl/${item.id}.png`;
                nameBulbapedia = item.name.replaceAll(" ", "_");

                pokemonButtons
                    .addComponents(new Discord.MessageButton({ label: 'More info', style: 'LINK', url: `https://bulbapedia.bulbagarden.net/wiki/${nameBulbapedia}(${item.effectType})` }));

                pokemonEmbed
                    .setAuthor({ name: `${item.name} (${item.effectType})` })
                    .setDescription(item.desc)
                    .addField("Introduced:", `Gen ${item.gen}`, true);
                if (item.fling) pokemonEmbed.addField("Fling Power:", item.fling.basePower.toString(), true);
                pokemonEmbed
                    .setImage(itemImage);
                break;

            // Moves
            case "move":
                let move = Dex.moves.get(subArgument);
                if (!move) return sendMessage({ client: client, message: message, content: `Sorry, I could not find a move by that name.` });

                nameBulbapedia = move.name.replaceAll(" ", "_");
                linkBulbapedia = `https://bulbapedia.bulbagarden.net/wiki/${nameBulbapedia}_(${move.effectType})`;

                let type = await getTypeEmotes(move.type);
                let category = move.category;

                let ppString = `${move.pp}|${move.pp * 1.2}|${move.pp * 1.4}|${move.pp * 1.6}`;
                let accuracy = `${move.accuracy}%`;
                if (move.accuracy === true) accuracy = "Can't miss";

                pokemonEmbed
                    .setAuthor({ name: `${move.name} (${move.effectType})` })
                    .setDescription(move.desc)
                    .addField("Introduced:", `Gen ${move.gen}`, true)
                    .addField("Type:", type, true)
                    .addField("Category:", category, true);
                if (move.basePower > 0) pokemonEmbed.addField("Power:", move.basePower.toString(), true);
                if (move.critRatio !== 1) pokemonEmbed.addField("Crit Rate:", move.critRatio.toString(), true);
                pokemonEmbed
                    .addField("Accuracy:", accuracy, true)
                    .addField("PP:", ppString, true)
                if (move.priority !== 0) pokemonEmbed.addField("Priority:", move.priority.toString(), true);
                if (move.contestType) pokemonEmbed.addField("Contest Type:", move.contestType, true);
                if (move.zMove && move.zMove.basePower && move.gen < 8) pokemonEmbed.addField("Z-Power:", move.zMove.basePower.toString(), true);
                if (move.maxMove && move.maxMove.basePower && move.maxMove.basePower > 1) pokemonEmbed.addField("Max Move Power:", move.maxMove.basePower.toString(), true);
                break;

            // Default: Pokémon
            default:
                // Public variables
                var pokemonName = args;
                var pokemonID;

                let minPkmID = 1; // Bulbasaur
                let maxPkmID = 898; // Calyrex

                // Catch Slash Command structure
                if (message.type == 'APPLICATION_COMMAND') pokemonName = pokemonName.slice(1);

                // Edgecase name corrections
                pokemonName = pokemonName.join("-").replace(" ", "-").replace(":", "").toLowerCase();
                await correctValue(correctionName, pokemonName);

                // Easter egg name aliases
                await correctValue(easterEggName, pokemonName);

                // Random Pokémon if argument is "random"
                let randomID = await randomNumber(minPkmID, maxPkmID);
                if (pokemonName.toLowerCase() == "random") pokemonName = randomID;

                P.getPokemonByName(pokemonName)
                    .then(async function (response) {
                        let messageObject = await getPokemon(client, message, response);
                        return sendMessage({ client: client, message: message, embeds: messageObject.embed, components: messageObject.buttons });

                    }).catch(function (e) {
                        // console.log(e);
                        if (e.toString().includes("Missing Permissions")) {
                            return logger(e, client, message);
                        } else {
                            return sendMessage({ client: client, message: message, content: `Could not find the specified Pokémon.` });
                        };
                    });
                break;
        };

        // Bulbapedia button
        if (linkBulbapedia) {
            pokemonButtons
                .addComponents(new Discord.MessageButton({ label: 'More info', style: 'LINK', url: linkBulbapedia }));
        };

        // Send function for all except default
        if (pokemonEmbed.author) sendMessage({ client: client, message: message, embeds: pokemonEmbed, components: pokemonButtons });
        return;

        // Correct common name discrepancies
        async function correctValue(object, input) {
            var uncorrectedNames = Object.keys(object);
            uncorrectedNames.forEach(function (key) {
                if (pokemonName == key) {
                    if (input == pokemonName) pokemonName = object[key];
                    if (input == pokemonID) pokemonID = object[key];
                };
            });
        };

        function getKeyByValue(object, value) {
            return Object.keys(object).find(key => object[key] === value);
        };

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "pokemon",
    aliases: ["pkm", "pkmn"],
    description: "Shows Pokémon data.",
    type: 1,
    options: [{
        name: "ability",
        type: 1,
        description: "Get info on an ability.",
        options: [{
            name: "ability-name",
            type: 3,
            description: "Get ability info by its English name.",
            required: true
        }]
    }, {
        name: "item",
        type: 1,
        description: "Get info on an item.",
        options: [{
            name: "item-name",
            type: 3,
            description: "Get item info by its English name.",
            required: true
        }]
    }, {
        name: "move",
        type: 1,
        description: "Get info on a move.",
        options: [{
            name: "move-name",
            type: 3,
            description: "Get move info by its English name.",
            required: true
        }]
    }, {
        name: "pokemon",
        type: 1,
        description: "Get info on a Pokémon.",
        options: [{
            name: "pokemon-name",
            type: 3,
            description: "Get Pokémon info by its English name.",
            required: true
        }]
    }]
};