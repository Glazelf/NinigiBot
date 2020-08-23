module.exports.run = async (client, message) => {
  // Import globals
  let globalVars = require('../events/ready');
  try {
    const { EligibleRoles } = require('../database/dbObjects');

    if (!message.member.hasPermission("MANAGE_ROLES")) return message.reply(globalVars.lackPerms);

    const input = message.content.slice(1).trim();
    const [, , arguments] = input.match(/(\w+)\s*([\s\S]*)/);

    if (arguments.length < 1) return message.channel.send(`> Please provide a role, ${message.author}.`);

    let roleId = await EligibleRoles.findOne({ where: { name: arguments } });
    const role = message.member.guild.roles.cache.find(role => role.name.toLowerCase() === arguments.toLowerCase());

    if (!role && !roleId) return message.channel.send(`> That role does not exist, ${message.author}.`);
    if (!roleId) roleId = await EligibleRoles.findOne({ where: { role_id: role.id } });
    if (role.managed == true) return message.channel.send(`> I can't manage the **${role.name}** role because it is being automatically managed by an integration, ${message.author}.`);
    if (message.guild.me.roles.highest.comparePositionTo(role) <= 0) return message.channel.send(`> I can't manage the **${role.name}** role because it is above my highest role, ${message.author}.`);

    if (roleId) {
      await roleId.destroy();
      return message.channel.send(`> The **${arguments}** role is no longer eligible to be selfassigned, ${message.author}.`);
    } else {

      await EligibleRoles.upsert({ role_id: role.id, name: arguments.toLowerCase() });
      return message.channel.send(`> The **${role.name}** role is now eligible to be selfassigned, ${message.author}.`);
    };

  } catch (e) {
    // log error
    console.log(e);

    // return confirmation
    return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${globalVars.prefix}info.`);
  };
};