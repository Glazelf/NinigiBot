exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const forever = require('forever');
        const getTime = require('../../util/getTime');

        if (message.member.id !== client.config.ownerID) return sendMessage(client, message, globalVars.lackPerms);

        let timestamp = await getTime(client);

        let user = message.member.user;

        if (args[0] != 'soft') {
            // Return message then destroy
            await sendMessage(client, message, `Starting shutdown for **${user.tag}**.\nRemoving all slash commands, context menus etc. might take a bit. They might take up to an hour to vanish on Discord's end.`);

            // Delete all global commands
            await client.application.commands.set([]);
        };

        // Delete all guild commands, disabled because we don't use guild-specific commands
        // await client.guilds.cache.forEach(guild => {
        //     try {
        //         guild.commands.set([]);
        //     } catch (e) {
        //         // console.log(e);
        //     };
        // });

        // Delete SAC specific commands
        // let guild = await client.guilds.fetch(client.config.botServerID);
        // await guild.commands.set([]);

        forever.stopAll();

        // Return confirm
        await sendMessage(client, message, `Shutdown completed.`);
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