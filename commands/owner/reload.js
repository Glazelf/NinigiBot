exports.run = async (client, message, args = null) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        if (message.author.id !== client.config.ownerID) return sendMessage(client, message, globalVars.lackPerms);

        const { Prefixes } = require('../../database/dbObjects');
        let prefix = await Prefixes.findOne({ where: { server_id: message.guild.id } });
        if (prefix) {
            prefix = prefix.prefix;
        } else {
            prefix = globalVars.prefix;
        };

        if (!args || args.length < 1) return sendMessage(client, message, `Must provide a command name to reload.`);
        const commandName = args[0];

        // Check if the command exists and is valid
        if (!client.commands.has(commandName)) {
            return sendMessage(client, message, `That command does not exist.`);
        };

        delete require.cache[require.resolve(`./${commandName}.js`)];

        // Delete and reload the command from the client.commands Enmap
        client.commands.delete(commandName);
        const props = require(`./${commandName}.js`);
        client.commands.set(commandName, props);
        return sendMessage(client, message, `The command \`${prefix}${commandName}\` has been reloaded.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "reload",
    aliases: [],
    description: "Reload a command file.",
    options: [{
        name: "command",
        type: "STRING",
        description: "Name of the command to reload."
    }]
};