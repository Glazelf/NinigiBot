exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(client, message.member);
        if (!adminBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        const { ModEnabledServers } = require('../../database/dbObjects');
        let serverID = await ModEnabledServers.findOne({ where: { server_id: message.guild.id } });

        // Database
        if (serverID) {
            await serverID.destroy();
            return sendMessage({ client: client, interaction: interaction, content: `**${message.guild.name}** will no longer be automatically moderated.` });
        } else {
            await ModEnabledServers.upsert({ server_id: message.guild.id });
            return sendMessage({ client: client, interaction: interaction, content: `**${message.guild.name}** will now be automatically moderated.` });
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "togglemod",
    description: "Toggle automated moderation features."
};