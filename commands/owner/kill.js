exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        if (message.member.id !== client.config.ownerID) return sendMessage(client, message, globalVars.lackPerms);

        const getTime = require('../../util/getTime');
        let timestamp = await getTime();

        await sendMessage(client, message, `Shutting down...`);

        // Delete all global commands
        await client.application.commands.set([]);

        // Delete all guild commands
        await client.guilds.cache.forEach(guild => {
            guild.commands.set([]);
        });

        // Delete SAC specific commands
        // await client.guilds.cache.get(client.config.botServerID).commands.set([]);

        // Return message then destroy

        console.log(`Bot killed by ${message.member.user.tag}. (${timestamp})`);
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