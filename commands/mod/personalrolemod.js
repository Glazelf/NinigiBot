module.exports.run = async (client, message, args) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (!message.member.hasPermission("MANAGE_ROLES") && message.author.id !== client.config.ownerID) return message.reply(globalVars.lackPerms);
        if (!message.channel.permissionsFor(message.guild.me).has("MANAGE_ROLES")) return message.channel.send(`> I don't have permission to manage roles, ${message.author}.`);
        return;

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "personalrolemod",
    aliases: ["prm"]
};