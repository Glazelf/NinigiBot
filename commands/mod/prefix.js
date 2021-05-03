module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply(globalVars.lackPerms);

        const { Prefixes } = require('../../database/dbObjects');
        let oldPrefix = await Prefixes.findOne({ where: { server_id: message.guild.id } });

        const args = message.content.split(' ');
        let subCommand = args[1];
        if (!subCommand) {
            if (oldPrefix) {
                return message.channel.send(`> The current prefix is: \`${oldPrefix.prefix}\`, ${message.author}.`);
            };
            return message.channel.send(`> Please provide a valid string to change the prefix to, ${message.author}.`);
        };
        subCommand = subCommand.toLowerCase();

        if (oldPrefix) await oldPrefix.destroy();
        if (subCommand == "?" || subCommand == "reset") return message.channel.send(`> Prefix has been reset to \`?\`, ${message.author}.`);
        await Prefixes.upsert({ server_id: message.guild.id, prefix: subCommand });

        return message.channel.send(`> Prefix has been changed to \`${subCommand}\`, ${message.author}.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "prefix",
    aliases: []
};