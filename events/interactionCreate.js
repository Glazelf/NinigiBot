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
        const { bank } = require('../database/bank');

        if (!interaction) return;
        if (interaction.user.bot) return;

        switch (interaction.type) {
            case "APPLICATION_COMMAND":
                if (!interaction.member) return sendMessage({ client: client, interaction: interaction, content: `Sorry, you're not allowed to use commands in private messages!\nThis is because a lot of the responses require a server to be present.\nDon't worry, similar to this message, most of my replies will be invisible to other server members!` });

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

                                if (role.managed) return sendMessage({ client: client, interaction: interaction, content: `I can't manage ${role} because it is being automatically managed by an integration.` });
                                if (interaction.guild.me.roles.highest.comparePositionTo(role) <= 0 && !adminBool) return sendMessage({ client: client, interaction: interaction, content: `I do not have permission to manage this role.` });

                                try {
                                    if (interaction.member.roles.cache.has(role.id)) {
                                        await interaction.member.roles.remove(role);
                                        return sendMessage({ client: client, interaction: interaction, content: `You no longer have ${role}!` });
                                    } else {
                                        await interaction.member.roles.add(role);
                                        return sendMessage({ client: client, interaction: interaction, content: `You now have ${role}!` });
                                    };
                                } catch (e) {
                                    return sendMessage({ client: client, interaction: interaction, content: `Failed to toggle ${role}, probably because I lack permissions.` });
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
                switch (interaction.commandName) {
                    case "pokemon":
                        switch (focusedOption.name) {
                            case "pokemon":
                                let pokemonSpecies = Dex.species.all();
                                await pokemonSpecies.forEach(species => {
                                    let pokemonIdentifier = `${species.num}: ${species.name}`;
                                    if ((pokemonIdentifier.toLowerCase().includes(focusedOption.value))
                                        && species.exists
                                        && species.isNonstandard !== "Custom"
                                        && species.isNonstandard !== "CAP") choices.push({ name: pokemonIdentifier, value: species.name });
                                });
                                break;
                            case "ability":
                                let abilities = Dex.abilities.all();
                                await abilities.forEach(ability => {
                                    if (ability.name.toLowerCase().includes(focusedOption.value.toLowerCase()) && ability.exists && ability.name !== "No Ability" && ability.isNonstandard !== "CAP") choices.push({ name: ability.name, value: ability.name });
                                });
                                break;
                            case "move":
                                let moves = Dex.moves.all();
                                await moves.forEach(move => {
                                    if (move.name.toLowerCase().includes(focusedOption.value.toLowerCase()) && move.exists && move.isNonstandard !== "CAP") choices.push({ name: move.name, value: move.name });
                                });
                                break;
                            case "item":
                                let items = Dex.items.all();
                                await items.forEach(item => {
                                    if (item.name.toLowerCase().includes(focusedOption.value.toLowerCase()) && item.exists) choices.push({ name: item.name, value: item.name });
                                });
                                break;
                            case "format":
                                let formats = Dex.formats.all();
                                await formats.forEach(format => {
                                    if (format.id.includes(focusedOption.value.toLowerCase())) choices.push({ name: format.id, value: format.id });
                                });
                                break;
                            case "rating":
                                let ratings = [0, 1500, 1630, 1760];
                                let formatInput = interaction.options._hoistedOptions.find(element => element.name == "format");
                                let formatInputValue = null;
                                if (formatInput) {
                                    formatInputValue = formatInput.value;
                                    if (formatInputValue.toLowerCase() == "ou" || formatInputValue.toLowerCase() == "gen8ou") ratings = [0, 1500, 1695, 1825];
                                };
                                await ratings.forEach(rating => {
                                    choices.push({ name: rating.toString(), value: rating });
                                });
                                break;
                        };
                        break;
                    case "monsterhunter":
                        switch (focusedOption.name) {
                            case "monster":
                                monstersJSON.monsters.forEach(monster => {
                                    if (monster.name.toLowerCase().includes(focusedOption.value.toLowerCase())) choices.push({ name: monster.name, value: monster.name });
                                });
                                break;
                            case "quest":
                                questsJSON.quests.forEach(quest => {
                                    if (quest.name.toLowerCase().includes(focusedOption.value.toLowerCase())) choices.push({ name: quest.name, value: quest.name });
                                });
                                break;
                            case "game":
                                let MHGames = ["Monster Hunter 3 Ultimate",
                                    "Monster Hunter 4 Ultimate",
                                    "Monster Hunter Generations Ultimate",
                                    "Monster Hunter World",
                                    "Monster Hunter Rise",
                                    "Monster Hunter Stories",
                                    "Monster Hunter Stories 2"];
                                await MHGames.forEach(game => {
                                    choices.push({ name: game, value: game });
                                });
                                break;
                        };
                        break;
                    case "coinflip":
                        switch (focusedOption.name) {
                            case "bet-amount":
                                let balance = await bank.currency.getBalance(interaction.user.id);
                                let balanceHalf = Math.floor(balance / 2);
                                let balanceQuarter = Math.floor(balance / 4);
                                choices.push({ name: balance.toString(), value: balance });
                                choices.push({ name: balanceHalf.toString(), value: balanceHalf });
                                choices.push({ name: balanceQuarter.toString(), value: balanceQuarter });
                                break;
                            case "side":
                                choices.push({ name: "Heads", value: "Heads" });
                                choices.push({ name: "Tails", value: "Tails" });
                                break;
                        };
                        break;
                    // VERY low priority
                    case "rps":
                        switch (focusedOption.name) {
                            case "weapon":
                                choices.push({ name: "Rock", value: "Rock" });
                                choices.push({ name: "Paper", value: "Paper" });
                                choices.push({ name: "Scissors", value: "Scissors" });
                                break;
                            case "bet-amount":
                                // Copied from coinflip command
                                let balance = await bank.currency.getBalance(interaction.user.id);
                                let balanceHalf = Math.floor(balance / 2);
                                let balanceQuarter = Math.floor(balance / 4);
                                choices.push({ name: balance.toString(), value: balance });
                                choices.push({ name: balanceHalf.toString(), value: balanceHalf });
                                choices.push({ name: balanceQuarter.toString(), value: balanceQuarter });
                                break;
                        };
                    case "shop":
                        switch (focusedOption.name) {
                            case "category":
                                choices.push({ name: "Equipment", value: "Equipment" });
                                choices.push({ name: "Food", value: "Food" });
                                break;
                        };
                    case "inventory":
                        break;
                };
                choices = [... new Set(choices)]; // Remove duplicates
                if (choices.length > 25) choices = choices.slice(0, 25); // Max 25 entries
                if (choices.length < 1) return interaction.respond([]);
                return interaction.respond(choices);
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