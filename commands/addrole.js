module.exports.run = async (client, message) => {
  try {
    const { EligibleRoles } = require('../storeObjects');

    // Import globals
    let globalVars = require('../events/ready');

    if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply(globalVars.lackPerms);

    const input = message.content.slice(1).trim();
    const [, , arguments] = input.match(/(\w+)\s*([\s\S]*)/);

    if (arguments.length < 1) return message.channel.send(`> Please provide a role, ${message.author}.`);

    const role = message.member.guild.roles.cache.find(role => role.name.toLowerCase() === arguments.toLowerCase());

    if (!role) return message.reply('That role does not exist.');

    const roleName = await EligibleRoles.findOne({ where: { name: role.name } });

    if (roleName) {
      await roleName.destroy();
      return message.channel.send(`The role **${role.name}** is no longer eligible to be selfassigned, ${message.author}.`);
    } else {
      await EligibleRoles.upsert({ name: role.name });
      return message.channel.send(`The role **${role.name}** is now eligible to be selfassigned, ${message.author}.`);
    };

  } catch (e) {
    // log error
    console.log(e);

    // return confirmation
    return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
  };
};