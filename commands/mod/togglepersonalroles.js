module.exports.run = async (client, message, args) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (!message.member.hasPermission("ADMINISTRATOR") && message.author.id !== client.config.ownerID) return message.reply(globalVars.lackPerms);
        if (!message.channel.permissionsFor(message.guild.me).has("MANAGE_ROLES")) return message.channel.send(`> I don't have permission to manage roles, ${message.author}.`);

        const { PersonalRoleServers } = require('../../database/dbObjects');
        let serverID = await PersonalRoleServers.findOne({ where: { server_id: message.guild.id } });

        if (serverID) {
            await serverID.destroy();
            return message.channel.send(`> Personal Roles can no longer be managed by users in ${message.guild.name}, ${message.author}.`);
        } else {
            await ModEnabledServers.upsert({ server_id: message.guild.id });
            return message.channel.send(`> Personal Roles can now be managed by users in ${message.guild.name}, ${message.author}.`);
        };

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