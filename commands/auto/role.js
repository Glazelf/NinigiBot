module.exports.run = async (client, message, args) => {
  // Import globals
  let globalVars = require('../../events/ready');
  try {
    if (!message.guild.me.hasPermission("MANAGE_ROLES")) return message.channel.send(`> Sorry, I don't have permissions to edit roles, ${message.author}.`);

    const { EligibleRoles } = require('../../database/dbObjects')
    const Discord = require("discord.js");

    let member = message.member;
    let arguments = args;

    const requestRole = arguments.join(' ');

    if (requestRole.length < 1) return message.channel.send(`> Please provide a role. Use \`${globalVars.prefix}role help\` to see the available roles, ${message.author}.`);

    const db = await EligibleRoles.findAll();
    const roles = db.map(role => role.role_id);

    if (roles.length < 1) return message.channel.send(`> There are no eligible roles to assign to yourself in this server, ${message.author}.`);

    if (requestRole.toLowerCase() === 'help') {
      let roleText = [];
      member.guild.roles.cache.each(role => {
        if (roles.includes(role.id)) {
          roleText.push(role);
        };
      });

      // Role sorting for role help
      roleText.sort((r, r2) => r2.position - r.position).join(", ");
      roleText = roleText.map(role => role.id);

      // Role help embed and logic
      let roleHelpMessage = "";

      for (let i = 0; i < roleText.length; i++) {
        roleHelpMessage = `${roleHelpMessage}
> <@&${roleText[i]}>`;
      };

      roleHelpMessage = `${roleHelpMessage}
Please don't tag these roles, just put the name.
Example: \`${globalVars.prefix}role rolename\``;

      let avatar = client.user.displayAvatarURL({ format: "png", dynamic: true });

      const rolesHelp = new Discord.MessageEmbed()
        .setColor(globalVars.embedColor)
        .setAuthor(`Available roles:`, avatar)
        .setDescription(roleHelpMessage)
        .setFooter(message.author.tag)
        .setTimestamp();
      return message.channel.send(rolesHelp);
    };

    const role = message.member.guild.roles.cache.find(role => role.name.toLowerCase() === requestRole.toLowerCase());

    let invalidRoleText = `> That role does not exist, ${message.author}. Use \`${globalVars.prefix}role help\` to see the available roles.`
    if (!role) return message.channel.send(invalidRoleText);
    if (!roles.includes(role.id)) return message.channel.send(invalidRoleText);
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