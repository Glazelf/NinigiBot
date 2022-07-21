exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = isAdmin(client, interaction.member);
        if (!adminBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        const { ModEnabledServers } = require('../../database/dbObjects/server.model');
        let serverID = await ModEnabledServers.findOne({ where: { server_id: interaction.guild.id } });

        // Database
        if (serverID) {
            await serverID.destroy();
            return sendMessage({ client: client, interaction: interaction, content: `**${interaction.guild.name}** will no longer be automatically moderated.` });
        } else {
            await ModEnabledServers.upsert({ server_id: interaction.guild.id });
            return sendMessage({ client: client, interaction: interaction, content: `**${interaction.guild.name}** will now be automatically moderated.` });
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