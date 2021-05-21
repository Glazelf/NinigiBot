module.exports.run = async (client, message, args = null) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { EligibleRoles } = require('../../database/dbObjects');

        const isAdmin = require('../../util/isAdmin');
        if (!message.member.permissions.has("MANAGE_ROLES") && !isAdmin(message.member, client)) return sendMessage(client, message, globalVars.lackPerms);

        const requestRole = args.join(' ').toLowerCase();

        if (requestRole.length < 1) return sendMessage(client, message, `Please provide a role.`);
        const role = message.guild.roles.cache.find(role => role.name.toLowerCase() == requestRole);
        if (!role) return sendMessage(client, message, `That role does not exist.`);
        let roleID = await EligibleRoles.findOne({ where: { role_id: role.id, name: requestRole } });

        if (role.managed == true) return sendMessage(client, message, `I can't manage the **${role.name}** role because it is being automatically managed by an integration.`);

        if (roleID) {
            let roleTag = role.name;
            await roleID.destroy();
            return sendMessage(client, message, `The **${roleTag}** role is no longer eligible to be selfassigned.`);
        } else {
            await EligibleRoles.upsert({ role_id: role.id, name: requestRole.toLowerCase() });
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