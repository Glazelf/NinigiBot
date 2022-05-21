module.exports = async (client, interaction) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('./ready');
    try {
        let isAdmin = require('../util/isAdmin');
        let sendMessage = require('../util/sendMessage');
        const getPokemon = require('../util/pokemon/getPokemon');
        const { Dex } = require('pokemon-showdown');
        const monstersJSON = require("../submodules/monster-hunter-DB/monsters.json");
        const questsJSON = require("../submodules/monster-hunter-DB/quests.json");
        const { EligibleRoles } = require('../database/dbObjects');
        if (!interaction) return;
        if (interaction.user.bot) return;

        switch (interaction.type) {
            case "APPLICATION_COMMAND":
                if (!interaction.member) return sendMessage({ client: client, interaction: interaction, content: `Sorry, you're not allowed to use commands in private messages!` });

                // Grab the command data from the client.commands Enmap
                let cmd;
                let commandName = interaction.commandName.toLowerCase().replace(" ", "");

                // Slower? command checker, since some commands user capitalization
                await client.commands.forEach(command => {
                    if (command.config.name.toLowerCase().replace(" ", "") == commandName) cmd = client.commands.get(commandName);
                });
                if (!cmd) {
                    if (client.aliases.has(commandName)) cmd = client.commands.get(client.aliases.get(commandName));
                };

                // Run the command
                if (cmd) {
                    try {
                        await cmd.run(client, interaction);
                    } catch (e) {
                        // console.log(e);
                        return;
                    };
                    return;
                } else {
                    return;
                };

            case "MESSAGE_COMPONENT":
                switch (interaction.componentType) {
                    case "BUTTON":
                        // Pokémon command
                        if (interaction.customId.startsWith("pkm")) {
                            let newPokemonName = null;
                            for (let componentRow of interaction.message.components) {
                                if (newPokemonName) break;
                                newPokemonName = componentRow.components.find(component => component.customId == interaction.customId);
                            };
                            if (!newPokemonName) return;
                            newPokemonName = newPokemonName.label;

                            let messageObject = null;
                            let pokemon = Dex.species.get(newPokemonName);
                            if (!pokemon || !pokemon.exists) return;
                            messageObject = await getPokemon(client, interaction, pokemon);

                            if (!messageObject) return;

                            await interaction.update({ embeds: [messageObject.embed], components: messageObject.buttons });
                            return;

                        } else if (interaction.customId.includes("minesweeper")) {
                            if (interaction.user.id !== interaction.customId.split("-")[3]) return;
                            let componentsCopy = interaction.message.components;
                            await componentsCopy.forEach(async function (part, index) {
                                await this[index].toJSON().components.forEach(function (part2, index2) {
                                    if (this[index2].custom_id == interaction.customId) {
                                        this[index2].emoji.name = interaction.customId.split("-")[2];
                                        this[index2].disabled = true; // Doesnt work??
                                    };
                                }, this[index].toJSON().components);
                            }, componentsCopy);
                            await interaction.update({ components: componentsCopy });
                            return;
                        } else {
                            // Other buttons
                            return;
                        };

                    case "SELECT_MENU":
                        if (interaction.customId == 'role-select') {
                            try {
                                // Toggle selected role
                                const role = await interaction.guild.roles.fetch(interaction.values[0]);
                                if (!role) return sendMessage({ client: client, interaction: interaction, content: `This role does not exist.` });
                                let adminBool = await isAdmin(client, interaction.guild.me);

                                let checkRoleEligibility = await EligibleRoles.findOne({ where: { role_id: role.id } });
                                if (!checkRoleEligibility) return sendMessage({ client: client, interaction: interaction, content: `This role is not available anymore.` });

                                if (role.managed) return sendMessage({ client: client, interaction: interaction, content: `I can't manage the **${role.name}** role because it is being automatically managed by an integration.` });
                                if (interaction.guild.me.roles.highest.comparePositionTo(role) <= 0 && !adminBool) return sendMessage({ client: client, interaction: interaction, content: `I do not have permission to manage this role.` });

                                try {
                                    if (interaction.member.roles.cache.has(role.id)) {
                                        await interaction.member.roles.remove(role);
                                        return sendMessage({ client: client, interaction: interaction, content: `You no longer have the **${role.name}** role!` });
                                    } else {
                                        await interaction.member.roles.add(role);
                                        return sendMessage({ client: client, interaction: interaction, content: `You now have the **${role.name}** role!` });
                                    };
                                } catch (e) {
                                    return sendMessage({ client: client, interaction: interaction, content: `Failed to toggle **${role.name}** for ${interaction.user}, probably because I lack permissions.`, ephemeral: false });
                                };
                            } catch (e) {
                                console.log(e);
                                return;
                            };

                        } else {
                            // Other select menus
                            return;
                        };
                    default:
                        // Other component types
                        return;
                };

            case "APPLICATION_COMMAND_AUTOCOMPLETE":
                let focusedOption = interaction.options.getFocused(true);
                let choices = [];
                let pokemonSpecies;
                switch (interaction.commandName) {
                    case "pokemon":
                        switch (focusedOption.name) {
                            case "pokemon-name":
                                pokemonSpecies = Dex.species.all();
                                await pokemonSpecies.forEach(species => {
                                    if (species.name.toLowerCase().includes(focusedOption.value.toLowerCase()) && species.exists && !species.isNonstandard) choices.push(species.name);
                                });
                                break;
                            case "ability-name":
                                let abilities = Dex.abilities.all();
                                await abilities.forEach(ability => {
                                    if (ability.name.toLowerCase().includes(focusedOption.value.toLowerCase()) && ability.exists && ability.name !== "No Ability" && !ability.isNonstandard) choices.push(ability.name);
                                });
                                break;
                            case "move-name":
                                let moves = Dex.moves.all();
                                await moves.forEach(move => {
                                    if (move.name.toLowerCase().includes(focusedOption.value.toLowerCase()) && move.exists) choices.push(move.name);
                                });
                                break;
                            case "item-name":
                                let items = Dex.items.all();
                                await items.forEach(item => {
                                    if (item.name.toLowerCase().includes(focusedOption.value.toLowerCase()) && item.exists) choices.push(item.name);
                                });
                                break;
                        };
                        break;
                    case "monsterhunter":
                        switch (focusedOption.name) {
                            case "monster-name":
                                monstersJSON.monsters.forEach(monster => {
                                    if (monster.name.toLowerCase().includes(focusedOption.value.toLowerCase())) choices.push(monster.name);
                                });
                                break;
                            case "quest-name":
                                questsJSON.quests.forEach(quest => {
                                    if (quest.name.toLowerCase().includes(focusedOption.value.toLowerCase())) choices.push(quest.name);
                                });
                                break;
                            case "game-name":
                                choices = ["Monster Hunter 3 Ultimate",
                                    "Monster Hunter 4 Ultimate",
                                    "Monster Hunter Generations Ultimate",
                                    "Monster Hunter World",
                                    "Monster Hunter Rise",
                                    "Monster Hunter Stories",
                                    "Monster Hunter Stories 2"];
                                break;
                        };
                        break;
                    case "usage":
                        switch (focusedOption.name) {
                            case "pokemon":
                                // Copied from pokemon command
                                pokemonSpecies = Dex.species.all();
                                await pokemonSpecies.forEach(species => {
                                    if (species.name.toLowerCase().includes(focusedOption.value.toLowerCase()) && species.exists && !species.isNonstandard) choices.push(species.name);
                                });
                                break;
                            case "format":
                                let formats = Dex.formats.all();
                                await formats.forEach(format => {
                                    if (format.id.includes(focusedOption.value.toLowerCase())) choices.push(format.id);
                                });
                                break;
                            case "rating":
                                // Does autocomplete even work with integers??
                                choices = [0, 1500, 1630, 1760];
                                let formatInput = interaction.options._hoistedOptions.find(element => element.name == "format");
                                let formatInputValue = null;
                                if (formatInput) {
                                    formatInputValue = formatInput.value;
                                    if (formatInputValue.toLowerCase() == "ou" || formatInputValue.toLowerCase() == "gen8ou") choices = [0, 1500, 1695, 1825];
                                };
                                break;
                        };
                        break;
                    case "coinflip":
                        switch (focusedOption.name) {
                            case "side":
                                choices = ["Heads", "Tails"];
                                break;
                        };
                        break;
                    // VERY low priority
                    case "inventory":
                        break;
                };
                choices = [... new Set(choices)]; // Remove duplicates
                if (choices.length > 25) choices = choices.slice(0, 25); // Max 25 entries
                if (choices.length < 1) return;
                return interaction.respond(choices.map((choice) => ({ name: choice.toString(), value: choice })));
                break;

            case "PING":
                return;

            default:
                return;
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};