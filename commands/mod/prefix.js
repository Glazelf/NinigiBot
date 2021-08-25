exports.run = async (client, message, args) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(message.member, client);
        if (!adminBool) return sendMessage(client, message, globalVars.lackPerms);

        const { Prefixes } = require('../../database/dbObjects');
        let oldPrefix = await Prefixes.findOne({ where: { server_id: message.guild.id } });

        let subCommand = args[0];
        if (!subCommand) {
            if (oldPrefix) {
                return sendMessage(client, message, `The current prefix is: \`${oldPrefix.prefix}\`.`);
            };
            return sendMessage(client, message, `Please provide a valid string to change the prefix to.`);
        };
        subCommand = subCommand.toLowerCase();

        if (oldPrefix) await oldPrefix.destroy();
        if (subCommand == "?" || subCommand == "reset") return sendMessage(client, message, `Prefix has been reset to \`?\`.`);
        await Prefixes.upsert({ server_id: message.guild.id, prefix: subCommand });

        return sendMessage(client, message, `Prefix has been changed to \`${subCommand}\`.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "prefix",
    aliases: [],
    description: "Change the prefix for this bot in this server."
};