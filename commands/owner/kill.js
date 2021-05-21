exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        if (message.author.id !== client.config.ownerID) return sendMessage(client, message, globalVars.lackPerms);

        const getTime = require('../../util/getTime');
        let timestamp = await getTime();

        // Delete all global commands
        client.application.commands.set([]);
        // Delete SAC specific commands
        client.guilds.cache.get(client.config.botServerID).commands.set([]);

        // Return message then destroy
        await sendMessage(client, message, `Shutting down...`);
        console.log(`Bot killed by ${message.author.tag}. (${timestamp})`);
        await client.destroy()
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