exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { EligibleRoles } = require('../../database/dbObjects');
        const isAdmin = require('../../util/isAdmin');
        let adminBoolBot = await isAdmin(client, message.guild.me);
        let adminBoolUser = await isAdmin(client, message.member);
        if (!message.member.permissions.has("MANAGE_ROLES") && !adminBoolUser) return sendMessage({ client: client, message: message, content: globalVars.lackPerms });

        // Get role and description
        let splitDescriptionCharacter = ";";
        let selectDescriptionCharacterLimit = 50;
        let requestRole = args.join(' ');
        let inputArray;
        let description;
        if (requestRole.includes(splitDescriptionCharacter)) {
            inputArray = requestRole.split(splitDescriptionCharacter);
            requestRole = inputArray[0].trim();
            description = inputArray[1].trim();
            if (description.length > selectDescriptionCharacterLimit) return sendMessage({ client: client, message: message, content: `Role description must be ${selectDescriptionCharacterLimit} characters or less.` });
        };

        requestRole = requestRole.toLowerCase();

        if (requestRole.length < 1) return sendMessage({ client: client, message: message, content: `Please provide a role.` });
        const role = message.guild.roles.cache.find(role => role.name.toLowerCase() == requestRole);
        if (!role) return sendMessage({ client: client, message: message, content: `That role does not exist.` });
        let roleIDs = await EligibleRoles.findAll({ where: { role_id: role.id } });

        if (role.managed == true) return sendMessage({ client: client, message: message, content: `I can't manage the **${role.name}** role because it is being automatically managed by an integration.` });
        if (message.guild.me.roles.highest.comparePositionTo(role) <= 0 && !adminBoolBot) return sendMessage({ client: client, message: message, content: `I can't manage the **${role.name}** role because it is above my highest role.` });
        if (message.member.roles.highest.comparePositionTo(role) <= 0 && !adminBoolUser) return sendMessage({ client: client, message: message, content: `You don't have a high enough role to make the **${role.name}** role selfassignable.` });

        // Database
        if (roleIDs.length > 0) {
            let roleTag = role.name;
            for await (const roleID of roleIDs) {
                roleID.destroy();
            };
            return sendMessage({ client: client, message: message, content: `The **${roleTag}** role is no longer eligible to be selfassigned.` });
        } else {
            if (description) {
                await EligibleRoles.upsert({ role_id: role.id, name: requestRole.toLowerCase(), description: description });
            } else {
                await EligibleRoles.upsert({ role_id: role.id, name: requestRole.toLowerCase() });
            };

            return sendMessage({ client: client, message: message, content: `The **${role.name}** role is now eligible to be selfassigned.` });
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
        name: "role-name",
        type: "STRING",
        description: "Specify role by name."
    }]
};