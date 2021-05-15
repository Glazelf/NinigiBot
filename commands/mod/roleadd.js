module.exports.run = async (client, message, args) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const { EligibleRoles } = require('../../database/dbObjects');

        const isAdmin = require('../../util/isAdmin');
        if (!message.member.hasPermission("MANAGE_ROLES") && !isAdmin(message.member, client)) return message.reply(globalVars.lackPerms);

        const requestRole = args.join(' ').toLowerCase();

        if (requestRole.length < 1) return message.reply(`Please provide a role.`);
        const role = message.guild.roles.cache.find(role => role.name.toLowerCase() == requestRole);
        if (!role) return message.reply(`That role does not exist.`);
        let roleID = await EligibleRoles.findOne({ where: { role_id: role.id, name: requestRole } });

        if (role.managed == true) return message.reply(`I can't manage the **${role.name}** role because it is being automatically managed by an integration.`);

        if (roleID) {
            let roleTag = role.name;
            await roleID.destroy();
            return message.reply(`The **${roleTag}** role is no longer eligible to be selfassigned.`);
        } else {
            await EligibleRoles.upsert({ role_id: role.id, name: requestRole.toLowerCase() });
            return message.reply(`The **${role.name}** role is now eligible to be selfassigned.`);
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "roleadd",
    aliases: ["addrole"]
};