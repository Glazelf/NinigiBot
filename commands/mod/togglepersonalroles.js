exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(message.member, client);
        if (!adminBool) return sendMessage(client, message, globalVars.lackPerms);

        const { PersonalRoleServers } = require('../../database/dbObjects');
        let serverID = await PersonalRoleServers.findOne({ where: { server_id: message.guild.id } });

        // Database
        if (serverID) {
            await serverID.destroy();
            return sendMessage(client, message, `Personal Roles can no longer be managed by users in **${message.guild.name}**.`);
        } else {
            await PersonalRoleServers.upsert({ server_id: message.guild.id });
            return sendMessage(client, message, `Personal Roles can now be managed by users in **${message.guild.name}**.`);
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "togglepersonalroles",
    aliases: ["tpr"],
    description: "Toggle personal roles in this server."
};