exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(message.member, client);
        if (!adminBool) return sendMessage(client, message, globalVars.lackPerms);

        const { ModEnabledServers } = require('../../database/dbObjects');
        let serverID = await ModEnabledServers.findOne({ where: { server_id: message.guild.id } });

        if (serverID) {
            await serverID.destroy();
            return sendMessage(client, message, `**${message.guild.name}** will no longer be automatically moderated.`);
        } else {
            await ModEnabledServers.upsert({ server_id: message.guild.id });
            return sendMessage(client, message, `**${message.guild.name}** will now be automatically moderated.`);
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "togglemod",
    aliases: ["tm"],
    description: "Toggle automated moderation features."
};