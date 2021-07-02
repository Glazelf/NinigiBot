module.exports.run = async (client, message, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { EligibleRoles } = require('../../database/dbObjects');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(message.member, client);
        if (!message.member.permissions.has("MANAGE_ROLES") && !adminBool) return sendMessage(client, message, globalVars.lackPerms);

        let splitDescriptionCharacter = ";";
        let selectDescriptionCharacterLimit = 50;
        let requestRole = args.join(' ');
        let inputArray;
        let description;
        if (requestRole.includes(splitDescriptionCharacter)) {
            inputArray = requestRole.split(splitDescriptionCharacter);
            requestRole = inputArray[0].trim();
            description = inputArray[1].trim();
            if (description.length > selectDescriptionCharacterLimit) return sendMessage(client, message, `Role description must be ${selectDescriptionCharacterLimit} characters or less.`);
        };

        requestRole = requestRole.toLowerCase();

        if (requestRole.length < 1) return sendMessage(client, message, `Please provide a role.`);
        const role = message.guild.roles.cache.find(role => role.name.toLowerCase() == requestRole);
        if (!role) return sendMessage(client, message, `That role does not exist.`);
        let roleIDs = await EligibleRoles.findAll({ where: { role_id: role.id } });

        if (role.managed == true) return sendMessage(client, message, `I can't manage the **${role.name}** role because it is being automatically managed by an integration.`);

        if (roleIDs.length > 0) {
            let roleTag = role.name;
            for await (const roleID of roleIDs) {
                roleID.destroy();
            };
            return sendMessage(client, message, `The **${roleTag}** role is no longer eligible to be selfassigned.`);
        } else {
            if (description) {
                await EligibleRoles.upsert({ role_id: role.id, name: requestRole.toLowerCase(), description: description });
            } else {
                await EligibleRoles.upsert({ role_id: role.id, name: requestRole.toLowerCase() });
            };

            return sendMessage(client, message, `The **${role.name}** role is now eligible to be selfassigned.`);
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "roleadd",
    aliases: ["addrole"],
    description: "Toggle a role's eligibility to be selfassigned.",
    options: [{
        name: "role-name",
        type: "STRING",
        description: "Specify role by name."
    }]
};