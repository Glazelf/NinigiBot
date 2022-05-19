exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        const forever = require('forever');
        const getTime = require('../../util/getTime');

        if (message.member.id !== client.config.ownerID) return sendMessage({ client: client, message: message, content: globalVars.lackPerms });

        let timestamp = await getTime(client);

        let user = message.member.user;

        if (args[0] != 'soft') {
            // Return message then destroy
            await sendMessage({ client: client, message: message, content: `Starting shutdown for **${user.tag}**.\nRemoving all slash commands, context menus etc. might take a bit. They might take up to an hour to vanish on Discord's end.` });

            // Delete all global commands
            await client.application.commands.set([]);

            // Delete all guild commands
            await client.guilds.cache.forEach(async (guild) => {
                let adminBool = await isAdmin(client, guild.me);
                if (adminBool) {
                    try {
                        guild.commands.set([]);
                    } catch (e) {
                        // console.log(e);
                    };
                };
            });
        };

        // Ignore forever if fails, mostly for test-bots not running it.
        try {
            forever.stopAll();
        } catch (e) {
            // console.log(e);
        };

        // Return confirm
        await sendMessage({ client: client, message: message, content: `Shutdown completed.` });
        console.log(`Bot killed by ${user.tag}. (${timestamp})`);

        await client.destroy();
        return process.exit();

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "kill",
    aliases: ["destroy"],
    description: "Shuts down bot."
};