const getPokemon = require('../util/pokemon/getPokemon');

module.exports = async (client, interaction) => {
    // Import globals
    let globalVars = require('./ready');
    try {
        let isAdmin = require('../util/isAdmin');
        let sendMessage = require('../util/sendMessage');
        if (!interaction) return;
        if (interaction.user.bot) return;

        switch (interaction.type) {
            case "APPLICATION_COMMAND":
                if (!interaction.member) return sendMessage(client, interaction, `Sorry, you're not allowed to use commands in private messages!`);

                const { DisabledChannels } = require('../database/dbObjects');
                const dbChannels = await DisabledChannels.findAll();

                // Format options into same structure as regular args[], holy shit this is ugly code but it works for now
                let args = [];
                await interaction.options.forEach(async option => {

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
                if (client.commands.has(interaction.commandName)) {
                    cmd = client.commands.get(interaction.commandName);
                } else if (client.aliases.has(interaction.commandName)) {
                    cmd = client.commands.get(client.aliases.get(interaction.commandName));
                } else {
                    return;
                };

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
                        if (interaction.customID == 'pkmleft' || interaction.customID == 'pkmright') {
                            try {
                                var Pokedex = require('pokedex-promise-v2');
                                var P = new Pokedex();

                                let pkmID = interaction.message.embeds[0].author.name.substring(0, 3);
                                let newPkmID = pkmID;
                                let maxPkmID = 898; // Calyrex

                                if (interaction.customID == 'pkmleft') {
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
                                            pkmEmbed = await getPokemon(client, interaction.message, response, interaction);
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
                        if (interaction.customID == 'role-select') {
                            try {
                                // Toggle selected role
                                const role = await interaction.guild.roles.fetch(interaction.values[0]);
                                let adminBool = await isAdmin(interaction.guild.me);

                                if (!role) return sendMessage(client, interaction, `This role does not exist.`);
                                if (role.managed) return sendMessage(client, interaction, `I can't manage the **${role.name}** role because it is being automatically managed by an integration.`);
                                if (interaction.guild.me.roles.highest.comparePositionTo(role) <= 0 && !adminBool) return sendMessage(`I do not have permission to manage this role.`);

                                if (interaction.member.roles.cache.has(role.id)) {
                                    await interaction.member.roles.remove(role);
                                    return sendMessage(client, interaction, `Removed **${role.name}** from your roles!`);
                                } else {
                                    await interaction.member.roles.add(role);
                                    return sendMessage(client, interaction, `Added **${role.name}** to your roles!`);
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