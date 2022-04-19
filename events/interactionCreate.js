module.exports = async (client, interaction) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('./ready');
    try {
        let isAdmin = require('../util/isAdmin');
        let sendMessage = require('../util/sendMessage');
        const getPokemon = require('../util/pokemon/getPokemon');
        if (!interaction) return;
        if (interaction.user.bot) return;

        switch (interaction.type) {
            case "APPLICATION_COMMAND":
                if (!interaction.member) return sendMessage({ client: client, message: interaction, content: `Sorry, you're not allowed to use commands in private messages!` });

                const { DisabledChannels } = require('../database/dbObjects');
                const dbChannels = await DisabledChannels.findAll();

                // Format options into same structure as regular args[], holy shit this is ugly code but it works for now
                let args = [];

                if (interaction.options._subcommand) args.push(interaction.options._subcommand);
                await interaction.options._hoistedOptions.forEach(async option => {
                    if (option.hasOwnProperty("options")) {
                        await option.options.forEach(async option => {
                            args.push(option.value);
                            if (option.hasOwnProperty("options")) {
                                await option.options.forEach(async option => {
                                    args.push(option.value);
                                });
                            };
                        });
                    } else {
                        args.push(option.value);
                    };
                });

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

                // Probably faster command checker, but fails when command uses capitalization (i.e. context menu)
                // if (client.commands.has(commandName)) {
                //     cmd = client.commands.get(commandName);
                // } else if (client.aliases.has(commandName)) {
                //     cmd = client.commands.get(client.aliases.get(commandName));
                // } else return;

                // Run the command
                if (cmd) {
                    try {
                        await cmd.run(client, interaction, args);
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
                            const { Dex } = require('pokemon-showdown');

                            let newPokemonName = interaction.message.components[0].components.find(component => component.customId == interaction.customId).label;

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
                                const { EligibleRoles } = require('../database/dbObjects');
                                const role = await interaction.guild.roles.fetch(interaction.values[0]);
                                if (!role) return sendMessage({ client: client, message: interaction, content: `This role does not exist.` });
                                let adminBool = await isAdmin(client, interaction.guild.me);

                                let checkRoleEligibility = await EligibleRoles.findOne({ where: { role_id: role.id } });
                                if (!checkRoleEligibility) return sendMessage({ client: client, message: interaction, content: `This role is not available anymore.` });

                                if (role.managed) return sendMessage({ client: client, message: interaction, content: `I can't manage the **${role.name}** role because it is being automatically managed by an integration.` });
                                if (interaction.guild.me.roles.highest.comparePositionTo(role) <= 0 && !adminBool) return sendMessage({ client: client, message: interaction, content: `I do not have permission to manage this role.` });

                                try {
                                    if (interaction.member.roles.cache.has(role.id)) {
                                        await interaction.member.roles.remove(role);
                                        return sendMessage({ client: client, message: interaction, content: `You no longer have the **${role.name}** role!` });
                                    } else {
                                        await interaction.member.roles.add(role);
                                        return sendMessage({ client: client, message: interaction, content: `You now have the **${role.name}** role!` });
                                    };
                                } catch (e) {
                                    return sendMessage({ client: client, message: interaction, content: `Failed to toggle **${role.name}** for ${interaction.member.user}, probably because I lack permissions.`, ephemeral: false });
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