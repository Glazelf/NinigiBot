const getPokemon = require('../util/pokemon/getPokemon');

module.exports = async (client, interaction) => {
    // Import globals
    let globalVars = require('./ready');
    try {
        if (interaction.user.bot) return;
        if (interaction.isCommand()) {
            if (!interaction.member) interaction.reply(`Sorry, you're not allowed to use commands in private messages!`);

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
                return cmd.run(client, interaction, args);
            } else {
                return;
            };

            // Buttons
        } else if (interaction.isMessageComponent()) {
            if (interaction.componentType == 'BUTTON') {
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

                        return interaction.update({ embeds: [pkmEmbed] });

                    } catch (e) {
                        console.log(e);
                        return;
                    };
                } else {
                    // Other buttons
                    return;
                };
            } else {
                // Other component types
                return;
            };
        } else {
            // Other interaction types
            return;
        };

    } catch (e) {
        // log error
        const logger = require('../util/logger');

        logger(e, client, interaction);
    };
};