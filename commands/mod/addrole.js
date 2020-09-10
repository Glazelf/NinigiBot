module.exports.run = async (client, message) => {
  // Import globals
  let globalVars = require('../../events/ready');
  try {
    const { EligibleRoles } = require('../../database/dbObjects');

    if (!message.member.hasPermission("MANAGE_ROLES")) return message.reply(globalVars.lackPerms);

    const args = message.content.split(' ');

    if (args[1].length < 1) return message.channel.send(`> Please provide a role, ${message.author}.`);

    let roleID = await EligibleRoles.findOne({ where: { name: args[1] } });
    const role = message.member.guild.roles.cache.find(role => role.name.toLowerCase() === args[1].toLowerCase());

    if (!role && !roleID) return message.channel.send(`> That role does not exist, ${message.author}.`);
    if (!roleID) roleID = await EligibleRoles.findOne({ where: { role_id: role.id } });
    if (role.managed == true) return message.channel.send(`> I can't manage the **${role.name}** role because it is being automatically managed by an integration, ${message.author}.`);
    if (message.guild.me.roles.highest.comparePositionTo(role) <= 0) return message.channel.send(`> I can't manage the **${role.name}** role because it is above my highest role, ${message.author}.`);

    if (roleID) {
      let roleTag = role.name;
      await roleID.destroy();
      return message.channel.send(`> The **${roleTag}** role is no longer eligible to be selfassigned, ${message.author}.`);
    } else {

      await EligibleRoles.upsert({ role_id: role.id, name: args[1].toLowerCase() });
      return message.channel.send(`> The **${role.name}** role is now eligible to be selfassigned, ${message.author}.`);
    };

  } catch (e) {
    // log error
    const logger = require('../../util/logger');

    logger(e, client, message);
  };
};
