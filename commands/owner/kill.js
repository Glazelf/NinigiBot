exports.run = (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (message.author.id !== client.config.ownerID) return message.reply(globalVars.lackPerms);

        const getTime = require('../util/getTime');
        let timestamp = await getTime();

        // Delete all commands incl. slash commands
        client.application.commands.set([]);

        // Return message then destroy
        message.reply(`Shutting down...`)
            .then(msg => client.destroy());
        console.log(`Bot killed by ${message.author}. (${timestamp})`);
        return;

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