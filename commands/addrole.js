module.exports.run = async (client, message) => {
  try {
    const { EligibleRoles } = require('../database/dbObjects');

    // Import globals
    let globalVars = require('../events/ready');

    //if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply(globalVars.lackPerms);

    const input = message.content.slice(1).trim();
    const [, , arguments] = input.match(/(\w+)\s*([\s\S]*)/);

    if (arguments.length < 1) return message.channel.send(`> Please provide a role, ${message.author}.`);

    let roleId = await EligibleRoles.findOne({ where: { name: arguments } });
    const role = message.member.guild.roles.cache.find(role => role.name.toLowerCase() === arguments.toLowerCase());
    if (!role&&!roleId) return message.reply('That role does not exist.');
    if (!roleId) roleId = await EligibleRoles.findOne({ where: { role_id: role.id} });

    if (roleId) {
      await roleId.destroy();
      return message.channel.send(`The role **${arguments}** is no longer eligible to be selfassigned, ${message.author}.`);
    } else {
      
      await EligibleRoles.upsert({ role_id: role.id, name: arguments.toLowerCase()});
      return message.channel.send(`The role **${role.name}** is now eligible to be selfassigned, ${message.author}.`);
    };

  } catch (e) {
    // log error
    console.log(e);

    // return confirmation
    return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
  };
};