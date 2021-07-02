module.exports.run = async (client, message, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const isAdmin = require("../../util/isAdmin");
        const { EligibleRoles, Prefixes } = require('../../database/dbObjects');
        let prefix = await Prefixes.findOne({ where: { server_id: message.guild.id } });
        if (prefix) {
            prefix = prefix.prefix;
        } else {
            prefix = globalVars.prefix;
        };

        await message.guild.roles.fetch();

        let member = message.member;
        let user;
        if (message.type == 'DEFAULT') {
            user = message.author;
        } else {
            user = message.member.user;
        };
        let requestRole = args.join(' ').toLowerCase();
        let adminBool = await isAdmin(message.guild.me);
        let embedDescriptionCharacterLimit = 4096;
        let selectOptionLimit = 25;

        let db = await EligibleRoles.findAll();
        let roles = [];
        let roleIDs = [];
        await db.forEach(eligibleRole => {
            roles.push({
                id: eligibleRole.role_id,
                description: eligibleRole.description
            });
            roleIDs.push(eligibleRole.role_id);
        });

        let roleText = [];
        member.guild.roles.cache.each(role => {
            if (roleIDs.includes(role.id)) {
                roleText.push(role);
            };
        });

        // Role sorting for role help
        roleText.sort((r, r2) => r2.position - r.position).join(", ");
        roleText = roleText.map(role => role.id);

        // Role help embed and logic
        let roleHelpMessage = "";
        let rolesArray = [];

        if (roleText.length > selectOptionLimit) {

            if (!args[0] || args[0] == "help") {
                for (let i = 0; i < roleText.length; i++) {
                    roleHelpMessage = `${roleHelpMessage}
        > ${i + 1}. <@&${roleText[i]}>`;
                };

                if (roleHelpMessage.length > 0) {
                    roleHelpMessage = `${roleHelpMessage}
        Please don't tag these roles, just put the name.
        Example: \`${prefix}role Minecraft\`
        If you wish to use a dropdown select menu, you need 25 or less selfassignable roles.`;
                } else {
                    return sendMessage(client, message, `No roles have been made selfassignable yet. Moderators can use \`${prefix}addrole\` to add roles to this list.`);
                };

                if (roleHelpMessage.length > embedDescriptionCharacterLimit) return sendMessage(client, message, `Embed descriptions can't be over ${embedDescriptionCharacterLimit} characters. Consider removing some roles.`);

                let avatar = client.user.displayAvatarURL({ format: "png", dynamic: true });

                const rolesHelp = new Discord.MessageEmbed()
                    .setColor(globalVars.embedColor)
                    .setAuthor(`Available roles: `, avatar)
                    .setDescription(roleHelpMessage)
                    .setFooter(user.tag)
                    .setTimestamp();
                return sendMessage(client, message, null, rolesHelp);
            } else {
                // Interaction code
                const role = message.guild.roles.cache.find(role => role.name.toLowerCase() === requestRole);

                let invalidRoleText = `That role does not exist or isn't selfassignable. Use \`${prefix}role help\` to see the available roles.`;
                if (!role) return sendMessage(client, message, invalidRoleText);
                if (!roles.includes(role.id)) return sendMessage(client, message, invalidRoleText);
                if (role.managed == true) return sendMessage(client, message, `I can't manage the **${role.name}** role because it is being automatically managed by an integration.`);
                if (message.guild.me.roles.highest.comparePositionTo(role) <= 0 && !adminBool) return sendMessage(client, message, `I can't manage the **${role.name}** role because it is above my highest role.`);

                if (member.roles.cache.has(role.id)) {
                    await member.roles.remove(role);
                    return sendMessage(client, message, `You no longer have the **${role.name}** role, ${member}. *booo*`);

                } else {
                    await member.roles.add(role);
                    return sendMessage(client, message, `You now have the **${role.name}** role, ${member}! Yay!`);
                };
            };

        } else {
            for await (const [key, value] of Object.entries(roles)) {
                let roleFetch = await message.guild.roles.cache.get(value['id'])
                if (!roleFetch) continue;
                rolesArray.push({
                    label: roleFetch.name,
                    value: value['id'],
                    description: value['description']
                });
            };
            if (rolesArray.length < 1) return sendMessage(client, message, `There are no roles available to be selfassigned in this server.`);
            let rolesSelects = new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageSelectMenu()
                        .setCustomID('role-select')
                        .setPlaceholder('Click here to drop down!')
                        .addOptions(rolesArray),
                );

            return sendMessage(client, message, `Choose a role to assign to yourself: `, null, null, true, rolesSelects);
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