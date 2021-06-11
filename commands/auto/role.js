module.exports.run = async (client, message, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const { EligibleRoles, Prefixes } = require('../../database/dbObjects');
        let prefix = await Prefixes.findOne({ where: { server_id: message.guild.id } });
        if (prefix) {
            prefix = prefix.prefix;
        } else {
            prefix = globalVars.prefix;
        };

        let member = message.member;
        const requestRole = args.join(' ').toLowerCase();

        if (!args[0]) return sendMessage(client, message, `Please provide a role. Use \`${prefix}role help\` to see the available roles.`);

        const db = await EligibleRoles.findAll();
        const roles = db.map(role => role.role_id);

        if (requestRole.toLowerCase() == 'help') {
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

            if (roleHelpMessage.length > 0) {
                roleHelpMessage = `${roleHelpMessage}
                Please don't tag these roles, just put the name.
                Example: \`${prefix}role Minecraft\``;
            } else {
                roleHelpMessage = `No roles have been made selfassignable yet. Moderators can use \`${prefix}addrole\` to add roles to this list.`;
            };


            if (roleHelpMessage.length > 1024) return sendMessage(client, message, `Your list of self-assignable roles is too long to fit in a single message. Consider removing some.`);

            let avatar = client.user.displayAvatarURL({ format: "png", dynamic: true });

            const rolesHelp = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor(`Available roles:`, avatar)
                .setDescription(roleHelpMessage)
                .setFooter(message.member.user.tag)
                .setTimestamp();
            return sendMessage(client, message, null, rolesHelp);
        };

        const role = message.guild.roles.cache.find(role => role.name.toLowerCase() === requestRole);

        let invalidRoleText = `That role does not exist or isn't selfassignable. Use \`${prefix}role help\` to see the available roles.`;
        if (!role) return sendMessage(client, message, invalidRoleText);
        if (!roles.includes(role.id)) return sendMessage(client, message, invalidRoleText);
        if (role.managed == true) return sendMessage(client, message, `I can't manage the **${role.name}** role because it is being automatically managed by an integration.`);
        if (message.guild.me.roles.highest.comparePositionTo(role) <= 0) return sendMessage(client, message, `I can't manage the **${role.name}** role because it is above my highest role.`);

        if (member.roles.cache.has(role.id)) {
            await member.roles.remove(role);
            return sendMessage(client, message, `You no longer have the **${role.name}** role, ${member}. *booo*`);

        } else {
            await member.roles.add(role);
            return sendMessage(client, message, `You now have the **${role.name}** role, ${member}! Yay!`);
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "role",
    aliases: ["roles", "rank"],
    description: "Toggles an eligible role.",
    options: [{
        name: "role-name",
        type: "STRING",
        description: "Specify the role name. Type \"help\" to see a list of eligible roles.",
        required: true
    }]
};