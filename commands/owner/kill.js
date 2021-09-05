exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const getLanguageString = require('../../util/getLanguageString');
        if (message.member.id !== client.config.ownerID) return sendMessage(client, message, globalVars.lackPerms);

        const getTime = require('../../util/getTime');
        let timestamp = await getTime();

        let user;
        if (message.type == 'DEFAULT') {
            user = message.author;
        } else {
            user = message.member.user;
        };

        // Return message then destroy
        await sendMessage(client, message, `Starting shutdown. Removing all slash commands, context menus etc. might take a bit. It might take up to an hour for them to vanish on Discord's end.`);

        // Delete all global commands
        await client.application.commands.set([]);

        // Delete all guild commands
        // await client.guilds.cache.forEach(guild => {
        //     try {
        //         guild.commands.set([]);
        //     } catch (e) {
        //         // console.log(e);
        //     };
        // });

        // Delete SAC specific commands
        // await client.guilds.cache.get(client.config.botServerID).commands.set([]);

        // Return confirm
        await sendMessage(client, message, `Shutdown completed.`);
        console.log(`Bot killed by ${user.tag}. (${timestamp})`);

        await client.destroy();
        return process.exit();

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "kill",
    aliases: ["destroy"],
    description: "Shuts down bot."
};