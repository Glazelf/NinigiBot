module.exports.run = async (client, message, args) => {
  // Import globals
  let globalVars = require('../../events/ready');
  try {
    const { EligibleRoles } = require('../../database/dbObjects');

    if (!message.member.hasPermission("MANAGE_ROLES") && message.author.id !== client.config.ownerID) return message.reply(globalVars.lackPerms);

    const requestRole = args.join(' ').toLowerCase();

    if (requestRole.length < 1) return message.channel.send(`> Please provide a role, ${message.author}.`);
    const role = message.guild.roles.cache.find(role => role.name === requestRole);
    let roleID = await EligibleRoles.findOne({ where: { role_id: role.id, name: requestRole } });

    if (!role && !roleID) return message.channel.send(`> That role does not exist, ${message.author}.`);
    if (role.managed == true) return message.channel.send(`> I can't manage the **${role.name}** role because it is being automatically managed by an integration, ${message.author}.`);
    if (message.guild.me.roles.highest.comparePositionTo(role) <= 0) return message.channel.send(`> I can't manage the **${role.name}** role because it is above my highest role, ${message.author}.`);

    if (roleID) {
      let roleTag = role.name;
      await roleID.destroy();
      return message.channel.send(`> The **${roleTag}** role is no longer eligible to be selfassigned, ${message.author}.`);
    } else {
      await EligibleRoles.upsert({ role_id: role.id, name: requestRole.toLowerCase() });
      return message.channel.send(`> The **${role.name}** role is now eligible to be selfassigned, ${message.author}.`);
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