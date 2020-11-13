module.exports.run = async (client, message, args) => {
  // Import globals
  let globalVars = require('../../events/ready');
  try {
    if (!message.guild.me.hasPermission("MANAGE_ROLES")) return message.channel.send(`> Sorry, I don't have permissions to edit roles, ${message.author}.`);

    const { EligibleRoles } = require('../../database/dbObjects')
    const Discord = require("discord.js");

    let member = message.member;
    let arguments = args;

    if (message.mentions.members.first()) {
      if (!message.member.hasPermission("MANAGE_ROLES")) return message.reply(globalVars.lackPerms);
      member = message.mentions.members.first();
      arguments.pop();
    };

    const requestRole = arguments.join(' ');

    if (requestRole.length < 1) return message.channel.send(`> Please provide a role. Use \`${globalVars.prefix}role help\` to see the available roles, ${message.author}.`);

    const db = await EligibleRoles.findAll();
    const roles = db.map(role => role.role_id);

    if (roles.length < 1) return message.channel.send(`> There are no eligible roles to assign to yourself in this server, ${message.author}.`);

    if (requestRole.toLowerCase() === 'help') {
      let roleText = []
      member.guild.roles.cache.each(role => {
        if (roles.includes(role.id)) {
          roleText.push(role)
        }
      });

      // Role sorting for role help
      roleText.sort((r, r2) => r2.position - r.position).join(", ");
      roleText = roleText.map(role => role.id);

      // Role help embed and logic
      let roleHelpMessage = "";

      for (let i = 0; i < roleText.length; i++) {
        roleHelpMessage = `${roleHelpMessage}
> <@&${roleText[i]}>`;
      }

      roleHelpMessage = `${roleHelpMessage}
Please don't tag these roles, just put the name.
Example: \`${globalVars.prefix}role rolename\``;

      let avatar = null;
      if (client.user.avatarURL()) avatar = client.user.avatarURL({ format: "png" });

      const rolesHelp = new Discord.MessageEmbed()
        .setColor(globalVars.embedColor)
        .setAuthor(`Available roles:`, avatar)
        .setDescription(roleHelpMessage)
        .setFooter(`Requested by ${message.author.tag}`)
        .setTimestamp();
      return message.channel.send(rolesHelp)
    };

    const role = message.member.guild.roles.cache.find(role => role.name.toLowerCase() === requestRole.toLowerCase());

    if (!role) return message.channel.send(`> That role does not exist, ${message.author}.`);
    if (!roles.includes(role.id)) return message.channel.send(`> Invalid role, use \`${globalVars.prefix}role help\` to see the available roles, ${message.author}.`);
    if (role.managed == true) return message.channel.send(`> I can't manage the **${role.name}** role because it is being automatically managed by an integration, ${message.author}.`);
    if (message.guild.me.roles.highest.comparePositionTo(role) <= 0) return message.channel.send(`> I can't manage the **${role.name}** role because it is above my highest role, ${message.author}.`);

    if (member.roles.cache.has(role.id)) {
      await member.roles.remove(role);
      return message.channel.send(`> You no longer have the **${role.name}** role, ${member}. *booo*`);

    } else {
      await member.roles.add(role);
      return message.channel.send(`> You now have the **${role.name}** role, ${member}! Yay!`);
    };

  } catch (e) {
    // log error
    const logger = require('../../util/logger');

    logger(e, client, message);
  };
};

module.exports.config = {
  name: "role",
  aliases: []
};