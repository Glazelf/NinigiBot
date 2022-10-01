const Discord = require('discord.js');

exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const forever = require('forever');
        const isAdmin = require('../../util/isAdmin');
        const isOwner = require('../../util/isOwner');
        const getTime = require('../../util/getTime');
        let ownerBool = await isOwner(client, interaction.user);
        if (!ownerBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        await interaction.deferReply({ ephemeral: true });

        let removeInteractions = false;
        let interactionsArg = interaction.options.getBoolean("remove-interactions");
        if (interactionsArg === true) removeInteractions = interactionsArg;

        let timestamp = await getTime(client);
        let shutdownString = "Shutting down.";
        if (removeInteractions) shutdownString += "\nRemoving all slash commands, context menus etc. This might take a bit.";
        await sendMessage({ client: client, interaction: interaction, content: shutdownString });

        if (removeInteractions) {
            // Delete all global commands
            await client.application.commands.set([]);
            // Delete all guild commands
            await client.guilds.cache.forEach(async (guild) => {
                guild.commands.set([]).catch(e => {
                    return;
                });
            });
        };

        // Ignore forever if fails, mostly for test-bots not running it.
        if (forever) {
            try {
                forever.stopAll();
            } catch (e) {
                console.log(e);
            };
        };

        console.log(`Bot killed by ${interaction.user.tag}. (${timestamp})`);

        await client.destroy();
        return process.exit();

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "kill",
    description: "Shuts down bot.",
    serverID: ["759344085420605471"],
    options: [{
        name: "remove-interactions",
        type: Discord.ApplicationCommandOptionType.Boolean,
        description: "Remove all interactions?"
    }]
};