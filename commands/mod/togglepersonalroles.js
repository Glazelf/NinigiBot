const Discord = require("discord.js");
exports.run = async (client, message) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(client, message.member);
        if (!adminBool) return sendMessage({ client: client, message: message, content: globalVars.lackPerms });

        const { PersonalRoleServers } = require('../../database/dbObjects');
        let serverID = await PersonalRoleServers.findOne({ where: { server_id: message.guild.id } });

        // Database
        if (serverID) {
            await serverID.destroy();
            return sendMessage({ client: client, message: message, content: `Personal Roles can no longer be managed by users in **${message.guild.name}**.` });
        } else {
            await PersonalRoleServers.upsert({ server_id: message.guild.id });
            return sendMessage({ client: client, message: message, content: `Personal Roles can now be managed by users in **${message.guild.name}**.` });
        };

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "togglepersonalroles",
    aliases: ["tpr"],
    description: "Toggle personal roles in this server."
};