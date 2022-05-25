exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { EligibleRoles } = require('../../database/dbObjects');
        const isAdmin = require('../../util/isAdmin');
        let adminBoolBot = isAdmin(client, interaction.guild.me);
        let adminBoolUser = isAdmin(client, interaction.member);
        if (!interaction.member.permissions.has("MANAGE_ROLES") && !adminBoolUser) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        let ephemeral = true;
        await interaction.deferReply({ ephemeral: ephemeral });

        let role = interaction.options.getRole("role");
        let description = null;
        let descriptionArg = interaction.options.getString("description");
        let selectDescriptionCharacterLimit = 50;
        if (descriptionArg) {
            description = descriptionArg;
            if (description.length > selectDescriptionCharacterLimit) return sendMessage({ client: client, interaction: interaction, content: `Role description must be ${selectDescriptionCharacterLimit} characters or less.` });
        };

        if (role.managed == true) return sendMessage({ client: client, interaction: interaction, content: `I can't manage the **${role.name}** role because it is being automatically managed by an integration.` });
        if (interaction.guild.me.roles.highest.comparePositionTo(role) <= 0 && !adminBoolBot) return sendMessage({ client: client, interaction: interaction, content: `I can't manage the **${role.name}** role because it is above my highest role.` });
        if (interaction.member.roles.highest.comparePositionTo(role) <= 0 && !adminBoolUser) return sendMessage({ client: client, interaction: interaction, content: `You don't have a high enough role to make the **${role.name}** role selfassignable.` });

        let roleIDs = await EligibleRoles.findAll({ where: { role_id: role.id } });
        if (roleIDs.length > 0) {
            let roleTag = role.name;
            for await (const roleID of roleIDs) {
                roleID.destroy();
            };
            return sendMessage({ client: client, interaction: interaction, content: `${role} is no longer eligible to be selfassigned.` });
        } else {
            if (description) {
                await EligibleRoles.upsert({ role_id: role.id, name: role.name, description: description });
            } else {
                await EligibleRoles.upsert({ role_id: role.id, name: role.name });
            };
            return sendMessage({ client: client, interaction: interaction, content: `${role} is now eligible to be selfassigned.` });
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "roleadd",
    description: "Toggle a role's eligibility to be selfassigned.",
    options: [{
        name: "role",
        type: "ROLE",
        description: "Specify role to toggle.",
        required: true
    }, {
        name: "description",
        type: "STRING",
        description: "Specify a description for the role."
    }]
};