exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        if (message.member.id !== client.config.ownerID) return sendMessage(client, message, globalVars.lackPerms);


        await sendMessage(client, message, `Removing all slash commands, context menus etc. might take a while. It might take up to an hour for them to vanish on Discord's end.`)
        // Delete all global commands
        await client.application.commands.set([]);

        // Delete all guild commands
        await client.guilds.cache.forEach(guild => {
            try {
                guild.commands.set([]);
            } catch (e) {
                // console.log(e);
            };
        });

        return sendMessage(client, message, `Removed all slash commands, context menus etc.`);

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "clearinteractions",
    aliases: [],
    description: "Clears all slash commands and other interactions."
};