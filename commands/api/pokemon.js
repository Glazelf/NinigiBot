exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const { Dex } = require('pokemon-showdown');
        const getPokemon = require('../../util/pokemon/getPokemon');
        const getTypeEmotes = require('../../util/pokemon/getTypeEmotes');
        const capitalizeString = require('../../util/capitalizeString');

        if (!args[0]) return sendMessage({ client: client, message: message, content: `You need to provide either a subcommand or a Pokémon to look up.` });

        let subCommand = args[0];
        let subArgument;
        if (args[1]) subArgument = args.slice(1).join("-").replace(" ", "-");

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
                linkBulbapedia = `https://bulbapedia.bulbagarden.net/wiki/${nameBulbapedia}_(ability)`;

                pokemonEmbed
                    .setAuthor({ name: ability.name })
                    .setDescription(ability.desc)
                    .addField("Introduced:", `Gen ${ability.gen}`, false);
                break;

            // Items
            case "item":
                let item = Dex.items.get(subArgument);
                if (!item || !item.exists) return sendMessage({ client: client, message: message, content: `Sorry, I could not find an item by that name.` });

                let itemImage = `https://www.serebii.net/itemdex/sprites/pgl/${item.id}.png`;

                nameBulbapedia = item.name.replaceAll(" ", "_");
                linkBulbapedia = `https://bulbapedia.bulbagarden.net/wiki/${nameBulbapedia}`;

                pokemonEmbed
                    .setAuthor({ name: item.name })
                    .setThumbnail(itemImage)
                    .setDescription(item.desc)
                    .addField("Introduced:", `Gen ${item.gen}`, true);
                if (item.fling) pokemonEmbed.addField("Fling Power:", item.fling.basePower.toString(), true);
                break;

            // Moves
            case "move":
                let move = Dex.moves.get(subArgument);
                if (!move || !move.exists) return sendMessage({ client: client, message: message, content: `Sorry, I could not find a move by that name.` });

                nameBulbapedia = move.name.replaceAll(" ", "_");
                linkBulbapedia = `https://bulbapedia.bulbagarden.net/wiki/${nameBulbapedia}_(move)`;

                let type = await getTypeEmotes(move.type);
                let category = move.category;

                let ppString = `${move.pp}|${move.pp * 1.2}|${move.pp * 1.4}|${move.pp * 1.6}`;
                if (move.pp == 1 || move.isMax) ppString = null;

                let accuracy = `${move.accuracy}%`;
                if (move.accuracy === true) accuracy = "Can't miss";

                // Smogon target is camelcased for some reason, this splits it on capital letters and formats them better
                let target = await capitalizeString(move.target.split(/(?=[A-Z])/).join(" "));
                if (target == "Normal") target = "Any Adjacent";

                let moveTitle = move.name;
                if (move.isMax) moveTitle = `${move.name} (Max Move)`;
                if (move.isZ) moveTitle = `${move.name} (Z-Move)`;

                pokemonEmbed
                    .setAuthor({ name: moveTitle })
                    .setDescription(move.desc)
                    .addField("Introduced:", `Gen ${move.gen}`, true)
                    .addField("Type:", type, true)
                    .addField("Category:", category, true);
                if (move.basePower > 0 && !move.isMax) pokemonEmbed.addField("Power:", move.basePower.toString(), true);
                pokemonEmbed.addField("Target:", target, true);
                if (move.critRatio !== 1) pokemonEmbed.addField("Crit Rate:", move.critRatio.toString(), true);
                pokemonEmbed
                    .addField("Accuracy:", accuracy, true);
                if (ppString) pokemonEmbed.addField("PP:", ppString, true);
                if (move.priority !== 0) pokemonEmbed.addField("Priority:", move.priority.toString(), true);
                // if (move.contestType) pokemonEmbed.addField("Contest Type:", move.contestType, true);
                // if (move.zMove && move.zMove.basePower && move.gen < 8) pokemonEmbed.addField("Z-Power:", move.zMove.basePower.toString(), true);
                if (move.maxMove && move.maxMove.basePower && move.maxMove.basePower > 1 && !move.isMax) pokemonEmbed.addField("Max Move Power:", move.maxMove.basePower.toString(), true);
                break;

            // Default: Pokémon
            default:
                let pokemonName = args;

                // Catch Slash Command structure
                if (message.type == 'APPLICATION_COMMAND') pokemonName = pokemonName.slice(1);

                // Edgecase name corrections
                pokemonName = pokemonName.join("-").replace(" ", "-").replace(":", "");

                let pokemon = Dex.species.get(pokemonName);
                if (!pokemon || !pokemon.exists) return sendMessage({ client: client, message: message, content: `Sorry, I could not find a Pokémon by that name.` });
                let messageObject = await getPokemon(client, message, pokemon);
                return sendMessage({ client: client, message: message, embeds: messageObject.embed, components: messageObject.buttons });
        };

        // Bulbapedia button
        if (linkBulbapedia) {
            pokemonButtons
                .addComponents(new Discord.MessageButton({ label: 'More info', style: 'LINK', url: linkBulbapedia }));
        };

        // Send function for all except default
        if (pokemonEmbed.author) sendMessage({ client: client, message: message, embeds: pokemonEmbed, components: pokemonButtons });
        return;

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