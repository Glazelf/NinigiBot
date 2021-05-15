module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const isAdmin = require('../../util/isAdmin');
        if (!isAdmin(message.member, client)) return message.reply(globalVars.lackPerms);

        const { Prefixes } = require('../../database/dbObjects');
        let oldPrefix = await Prefixes.findOne({ where: { server_id: message.guild.id } });

        const args = message.content.split(' ');
        let subCommand = args[1];
        if (!subCommand) {
            if (oldPrefix) {
                return message.reply(`The current prefix is: \`${oldPrefix.prefix}\`.`);
            };
            return message.reply(`Please provide a valid string to change the prefix to.`);
        };
        subCommand = subCommand.toLowerCase();

        if (oldPrefix) await oldPrefix.destroy();
        if (subCommand == "?" || subCommand == "reset") return message.reply(`Prefix has been reset to \`?\`.`);
        await Prefixes.upsert({ server_id: message.guild.id, prefix: subCommand });

        return message.reply(`Prefix has been changed to \`${subCommand}\`.`);

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