exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        let forever;
        if (client.config.forever) forever = require('forever');
        const getTime = require('../../util/getTime');

        if (interaction.member.id !== client.config.ownerID) return sendMessage(client, interaction, globalVars.lackPerms);

        let timestamp = await getTime(client);

        let user = interaction.member.user;

        if (args[0] != 'soft') {
            // Return interaction then destroy
            await sendMessage(client, interaction, `Shutting down.\nRemoving all slash commands, context menus etc. might take a bit. They might take up to an hour to vanish on Discord's end.`);

            // Delete all global commands
            await client.application.commands.set([]);

            // Delete all guild commands
            await client.guilds.cache.forEach(async (guild) => {
                try {
                    await guild.commands.set([]);
                } catch (e) {
                    // console.log(e);
                };
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

        console.log(`Bot killed by ${user.tag}. (${timestamp})`);

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
    defaultPermission: true, // Revert for release
    permission: "owner",
};