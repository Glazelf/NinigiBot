const Discord = require('discord.js');

exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = isAdmin(client, interaction.member);
        if (!adminBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        const { PersonalRoleServers } = require('../../database/dbServices/server.api');
        let serverID = await PersonalRoleServers.findOne({ where: { server_id: interaction.guild.id } });

        // Database
        if (serverID) {
            await serverID.destroy();
            return sendMessage({ client: client, interaction: interaction, content: `Personal Roles can no longer be managed by users in **${interaction.guild.name}**.` });
        } else {
            await PersonalRoleServers.upsert({ server_id: interaction.guild.id });
            return sendMessage({ client: client, interaction: interaction, content: `Personal Roles can now be managed by users in **${interaction.guild.name}**.` });
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "togglepersonalroles",
    description: "Toggle personal roles in this server."
};