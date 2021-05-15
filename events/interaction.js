module.exports = async (client, interaction) => {
    // Import globals
    let globalVars = require('./ready');
    try {
        if (!interaction.isCommand()) return;
        if (interaction.user.bot) return;

        if (!interaction.member) interaction.reply(`Sorry, you're not allowed to use commands in private messages!`);

        const { DisabledChannels } = require('../database/dbObjects');
        const dbChannels = await DisabledChannels.findAll();
        const channels = dbChannels.map(channel => channel.channel_id);

        // Grab the command data from the client.commands Enmap
        let cmd;
        if (client.commands.has(interaction.commandName)) {
            cmd = client.commands.get(interaction.commandName);
        } else if (client.aliases.has(interaction.commandName)) {
            cmd = client.commands.get(client.aliases.get(interaction.commandName));
        } else return;

        // Ignore messages sent in a disabled channel
        if (channels.includes(interaction.channelID) && !interaction.member.permissions.has("MANAGE_CHANNELS")) return interaction.reply(`Commands have been disabled in this channel.`, { ephemeral: true });

        // Run the command
        if (cmd) {
            return cmd.run(client, interaction);
        } else return;

    } catch (e) {
        // log error
        const logger = require('../util/logger');

        logger(e, client);
    };
};