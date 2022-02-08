exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const Pokedex = await import('pokedex-promise-v2');
        const P = new Pokedex.default();
        const correctionName = require('../../objects/pokemon/correctionName.json');
        const easterEggName = require('../../objects/pokemon/easterEggName.json');
        const getPokemon = require('../../util/pokemon/getPokemon');
        const getTypeEmotes = require('../../util/pokemon/getTypeEmotes');
        const capitalizeString = require('../../util/capitalizeString');
        const randomNumber = require('../../util/randomNumber');

        let arrowUp = "<:arrow_up_red:909901820732784640>";
        let arrowDown = "<:arrow_down_blue:909903420054437929>";

        let ephemeral = true;
        let argEphemeral = args.find(element => element.name == "ephemeral");
        if (argEphemeral) ephemeral = argEphemeral.value;

        let pokemonEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setFooter({ text: interaction.user.tag })
            .setTimestamp();

        let pokemonButtons = new Discord.MessageActionRow();

        switch (interaction.options.getSubcommand()) {
            // Abilities
            case "ability":
                let abilitySearch = args.find(element => element.name == "ability-name").value.toLowerCase();
                await P.getAbilityByName(abilitySearch)
                    .then(async function (response) {
                        // Why are german entries still tagged as English?
                        // let englishEntry = response.effect_entries.find(element => element.language.name = "en");
                        // English entries always seem to be either the only or the last entry, so this should work. For now.
                        let abilityDescription;
                        let englishEntry = response.effect_entries.find(element => element.language.name == "en");

                        if (englishEntry) {
                            abilityDescription = englishEntry.short_effect;
                        } else {
                            englishEntry = response.flavor_text_entries.find(element => element.language.name == "en");
                            abilityDescription = englishEntry.flavor_text;
                        };

                        let abilityName = await capitalizeString(response.name);
                        let nameBulbapedia = abilityName.replaceAll(" ", "_");

                        // Buttons
                        pokemonButtons
                            .addComponents(new Discord.MessageButton({ label: 'More info', style: 'LINK', url: `https://bulbapedia.bulbagarden.net/wiki/${nameBulbapedia}_(Ability)` }));

                        pokemonEmbed
                            .setAuthor({ name: abilityName })
                            .addField("Description:", abilityDescription, false);

                    }).catch(function (e) {
                        console.log(e);
                        if (e.toString().includes("Missing Permissions")) {
                            return logger(e, client, interaction);
                        } else {
                            return sendMessage({ client: client, interaction: interaction, content: `Could not find the specified ability.` });
                        };
                    });
                break;

            // Items
            case "item":
                let itemSearch = args.find(element => element.name == "item-name").value.toLowerCase();
                await P.getItemByName(itemSearch)
                    .then(async function (response) {
                        let itemName = response.name.replace("-", "").toLowerCase();
                        let itemImage = `https://www.serebii.net/itemdex/sprites/pgl/${itemName}.png`;
                        let itemAuthorName = await capitalizeString(response.name);
                        let nameBulbapedia = itemAuthorName.replaceAll(" ", "_");
                        let category = await capitalizeString(response.category.name);

                        let effectEntry = response.effect_entries.find(element => element.language.name == "en");
                        let description = effectEntry.short_effect;

                        pokemonButtons
                            .addComponents(new Discord.MessageButton({ label: 'More info', style: 'LINK', url: `https://bulbapedia.bulbagarden.net/wiki/${nameBulbapedia}` }));

                        pokemonEmbed
                            .setAuthor({ name: itemName })
                            .setThumbnail(response.sprites.default)
                            .addField("Category:", category, true)
                            .addField("Description:", description, false)
                            .setImage(itemImage);

                    }).catch(function (e) {
                        // console.log(e);
                        if (e.toString().includes("Missing Permissions")) {
                            return logger(e, client, interaction);
                        } else {
                            return sendMessage({ client: client, interaction: interaction, content: `Could not find the specified item.` });
                        };
                    });
                break;

            // Moves
            case "move":
                let moveSearch = args.find(element => element.name == "move-name").value.toLowerCase();
                await P.getMoveByName(moveSearch)
                    .then(async function (response) {
                        let description;
                        try {
                            let effectEntry = response.effect_entries.find(element => element.language.name == "en");
                            description = effectEntry.short_effect.replace("$effect_chance", response.effect_chance);
                        } catch (e) {
                            description = null;
                        };
                        let moveName = await capitalizeString(response.name);
                        let nameBulbapedia = moveName.replaceAll(" ", "_");
                        let type = await getTypeEmotes(response.type.name);
                        let category = await capitalizeString(response.damage_class.name);
                        let target = await capitalizeString(response.target.name);
                        let ppString;
                        if (response.pp) ppString = `${response.pp}|${response.pp * 1.2}|${response.pp * 1.4}|${response.pp * 1.6}`;

                        pokemonButtons
                            .addComponents(new Discord.MessageButton({ label: 'More info', style: 'LINK', url: `https://bulbapedia.bulbagarden.net/wiki/${nameBulbapedia}_(move)` }));

                        pokemonEmbed
                            .setAuthor({ name: moveName })
                            .addField("Type:", type, true)
                            .addField("Category:", category, true);
                        if (response.power) pokemonEmbed.addField("Power:", response.power.toString(), true);
                        if (response.accuracy) pokemonEmbed.addField("Accuracy:", `${response.accuracy}%`, true);
                        if (response.pp) pokemonEmbed.addField("PP:", ppString, true)
                        if (response.priority !== 0) pokemonEmbed.addField("Priority:", response.priority.toString(), true);
                        pokemonEmbed
                            .addField("Target:", target, true);
                        if (description) pokemonEmbed.addField("Description:", description, false);

                    }).catch(function (e) {
                        // console.log(e);
                        if (e.toString().includes("Missing Permissions")) {
                            return logger(e, client, interaction);
                        } else {
                            return sendMessage({ client: client, interaction: interaction, content: `Could not find the specified move.` });
                        };
                    });
                break;

            case "nature":
                let natureSearch = args.find(element => element.name == "nature-name").value.toLowerCase();
                await P.getNatureByName(natureSearch)
                    .then(async function (response) {
                        let author = await capitalizeString(response.name);
                        let statUp;
                        let statDown;
                        let statString;
                        let flavourUp;
                        let flavourDown;
                        let flavourString;

                        if (response.increased_stat && response.increased_stat.name) {
                            statUp = await capitalizeString(response.increased_stat.name);
                            statDown = await capitalizeString(response.decreased_stat.name);
                            statString = `${arrowUp} ${statUp}\n${arrowDown} ${statDown}`;

                            flavourUp = await capitalizeString(response.likes_flavor.name);
                            flavourDown = await capitalizeString(response.hates_flavor.name);
                            flavourString = `${arrowUp} ${flavourUp}\n${arrowDown} ${flavourDown}`;
                        } else {
                            statString = "Neutral";
                            flavourString = statString;
                        };

                        pokemonEmbed
                            .setAuthor({ name: author })
                            .addField("Stats:", statString)
                            .addField("Flavours:", flavourString)

                    }).catch(function (e) {
                        // console.log(e);
                        if (e.toString().includes("Missing Permissions")) {
                            return logger(e, client, interaction);
                        } else {
                            return sendMessage({ client: client, interaction: interaction, content: `Could not find the specified nature.` });
                        };
                    });
                break;

            // Pokémon
            case "pokemon":
                // Public variables
                var pokemonName = args.find(element => element.name == "pokemon-name").value.toLowerCase();
                var pokemonID;

                let minPkmID = 1; // Bulbasaur
                let maxPkmID = 898; // Calyrex

                // Edgecase name corrections
                pokemonName = pokemonName.replace(" ", "-").replace(":", "").toLowerCase();
                await correctValue(correctionName, pokemonName);

                // Easter egg name aliases
                await correctValue(easterEggName, pokemonName);

                // Random Pokémon if argument is "random"
                let randomID = await randomNumber(minPkmID, maxPkmID);
                if (pokemonName.toLowerCase() == "random") pokemonName = randomID;

                P.getPokemonByName(pokemonName)
                    .then(async function (response) {
                        let messageObject = await getPokemon(client, interaction, response);
                        return sendMessage({ client: client, interaction: interaction, embeds: messageObject.embed, components: messageObject.buttons });

                    }).catch(function (e) {
                        // console.log(e);
                        if (e.toString().includes("Missing Permissions")) {
                            return logger(e, client, interaction);
                        } else {
                            return sendMessage({ client: client, interaction: interaction, content: `Could not find the specified Pokémon.` });
                        };
                    });
                break;
        };

        // Send fucntion for all except default
        if (pokemonEmbed.author) sendMessage({ client: client, interaction: interaction, embeds: pokemonEmbed, components: pokemonButtons, ephemeral: ephemeral });
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
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "pokemon",
    description: "Shows Pokémon data.",
    type: "SUB_COMMAND",
    options: [{
        name: "ability",
        type: "SUB_COMMAND",
        description: "Get info on an ability.",
        options: [{
            name: "ability-name",
            type: "STRING",
            description: "Get ability info by its English name.",
            required: true
        },
        {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether this command is only visible to you."
        }]
    }, {
        name: "item",
        type: "SUB_COMMAND",
        description: "Get info on an item.",
        options: [{
            name: "item-name",
            type: "STRING",
            description: "Get item info by its English name.",
            required: true
        },
        {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether this command is only visible to you."
        }]
    }, {
        name: "move",
        type: "SUB_COMMAND",
        description: "Get info on a move.",
        options: [{
            name: "move-name",
            type: "STRING",
            description: "Get move info by its English name.",
            required: true
        },
        {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether this command is only visible to you."
        }]
    }, {
        name: "nature",
        type: "SUB_COMMAND",
        description: "Get info on a nature.",
        options: [{
            name: "nature-name",
            type: "STRING",
            description: "Get nature info by its English name.",
            required: true
        },
        {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether this command is only visible to you."
        }]
    }, {
        name: "pokemon",
        type: "SUB_COMMAND",
        description: "Get info on a Pokémon.",
        options: [{
            name: "pokemon-name",
            type: "STRING",
            description: "Get Pokémon info by its English name.",
            required: true
        },
        {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether this command is only visible to you."
        }]
    }]
};