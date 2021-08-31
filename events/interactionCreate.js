const getPokemon = require('../util/pokemon/getPokemon');

module.exports = async (client, interaction) => {
    // Import globals
    let globalVars = require('./ready');
    try {
        const getLanguageString = require('../util/getLanguageString');
        let sendMessage = require('../util/sendMessage');
        let isAdmin = require('../util/isAdmin');
        if (!interaction) return;
        if (interaction.user.bot) return;

        const { DisabledChannels, Languages } = require('../database/dbObjects');
        let dbLanguage = await Languages.findOne({ where: { server_id: interaction.guild.id } });
        let language = globalVars.language;
        if (dbLanguage) language = dbLanguage.language;

        switch (interaction.type) {
            case "APPLICATION_COMMAND":
                if (!interaction.member) return sendMessage(client, interaction, `Sorry, you're not allowed to use commands in private messages!`);
                const dbChannels = await DisabledChannels.findAll();

                // Format options into same structure as regular args[], holy shit this is ugly code but it works for now
                let args = [];
                await interaction.options._hoistedOptions.forEach(async option => {
                    if (option.type == 'SUB_COMMAND') {
                        args.push(option.name);
                        if (option.hasOwnProperty("options")) {
                            await option.options.forEach(async option => {
                                args.push(option.value);
                                if (option.hasOwnProperty("options")) {
                                    await option.options.forEach(async option => {
                                        args.push(option.value);
                                    });
                                };
                            });
                        };
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
                    await cmd.run(client, interaction, args);
                    return;
                } else {
                    return;
                };

            case "MESSAGE_COMPONENT":
                switch (interaction.componentType) {
                    case "BUTTON":
                        // Pokémon command
                        if (interaction.customId == 'pkmleft' || interaction.customId == 'pkmright') {
                            try {
                                var Pokedex = require('pokedex-promise-v2');
                                var P = new Pokedex();

                                let pkmID = interaction.message.embeds[0].author.name.substring(0, 3);
                                let newPkmID = pkmID;
                                let maxPkmID = 898; // Calyrex

                                if (interaction.customId == 'pkmleft') {
                                    newPkmID = parseInt(pkmID) - 1;
                                } else {
                                    newPkmID = parseInt(pkmID) + 1;
                                };

                                if (newPkmID < 1) {
                                    newPkmID = maxPkmID;
                                } else if (newPkmID > maxPkmID) {
                                    newPkmID = 1;
                                };

                                let pkmEmbed = null;

                                try {
                                    await P.getPokemonByName(newPkmID)
                                        .then(async function (response) {
                                            pkmEmbed = await getPokemon(client, interaction.message, response, interaction, language);
                                        });
                                } catch (e) {
                                    console.log(e);
                                    return;
                                };
                                if (!pkmEmbed) return;

                                await interaction.update({ embeds: [pkmEmbed] });
                                return;

                            } catch (e) {
                                // console.log(e);
                                return;
                            };
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
                                if (!role) return sendMessage(client, interaction, `This role does not exist.`);
                                let adminBool = await isAdmin(interaction.guild.me);

                                let checkRoleEligibility = await EligibleRoles.findOne({ where: { role_id: role.id } });
                                if (!checkRoleEligibility) return sendMessage(client, interaction, `This role is not available anymore.`);

                                if (role.managed) return sendMessage(client, interaction, `I can't manage the **${role.name}** role because it is being automatically managed by an integration.`);
                                if (interaction.guild.me.roles.highest.comparePositionTo(role) <= 0 && !adminBool) return sendMessage(`I do not have permission to manage this role.`);

                                try {
                                    if (interaction.member.roles.cache.has(role.id)) {
                                        await interaction.member.roles.remove(role);
                                        return sendMessage(client, interaction, `Removed **${role.name}** from your roles!`);
                                    } else {
                                        await interaction.member.roles.add(role);
                                        return sendMessage(client, interaction, `Added **${role.name}** to your roles!`);
                                    };
                                } catch (e) {
                                    return sendMessage(client, interaction, `Failed to toggle **${role.name}** for ${interaction.member.user}, probably because I lack permissions.`, null, null, false);
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
        // log error
        const logger = require('../util/logger');

        logger(e, client, interaction);
    };
};