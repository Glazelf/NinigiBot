module.exports = async (client, interaction) => {
    // Import globals
    let globalVars = require('./ready');
    try {
        if (!interaction.isCommand()) return;
        if (interaction.user.bot) return;

        if (!interaction.member) interaction.reply(`Sorry, you're not allowed to use commands in private messages!`);

        const { DisabledChannels } = require('../database/dbObjects');
        const dbChannels = await DisabledChannels.findAll();

        // Format options into same structure as regular args[], holy shit this is ugly code but it works for now
        let args = [];
        await interaction.options.forEach(async option => {
            args.push(option.name);
            if (option.hasOwnProperty("options")) {
                await option.options.forEach(async option => {
                    args.push(option.value);
                    if (option.hasOwnProperty("options")) {
                        await option.options.forEach(async option => {
                            args.push(option.name);
                        });
                    };
                });
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

    } catch (e) {
        // log error
        const logger = require('../util/logger');

        logger(e, client, interaction);
    };
};