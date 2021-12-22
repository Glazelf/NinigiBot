exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const isAdmin = require("../../util/isAdmin");
        const { EligibleRoles } = require('../../database/dbObjects');

        await interaction.guild.roles.fetch();

        let member = interaction.member;
        let user = interaction.member.user;

        let roleArgument = args.find(element => element.name == 'role');
        let requestRole = null;
        if (roleArgument) requestRole = roleArgument.value;
        let adminBoolBot = await isAdmin(client, interaction.guild.me);
        let embedDescriptionCharacterLimit = 4096;
        let selectOptionLimit = 25;

        let db = await EligibleRoles.findAll();
        let roles = [];
        let roleIDs = [];
        let roleText = [];
        await db.forEach(eligibleRole => {
            roleIDs.push(eligibleRole.role_id);
        });
        await member.guild.roles.cache.each(async (role) => {
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

        if (!requestRole) {
            // Select Menu
            if (!args[0] && roleText.length <= selectOptionLimit) {
                await db.forEach(async (eligibleRole) => {
                    let currentRole = await interaction.guild.roles.fetch(eligibleRole.role_id);
                    if (!currentRole) return;
                    roles.push({
                        role: currentRole,
                        description: eligibleRole.description
                    });
                    roleIDs.push(eligibleRole.role_id);
                });
                roles = Object.entries(roles).sort((a, b) => b[1].role.position - a[1].role.position);
                for await (const [key, value] of Object.entries(roles)) {
                    let currentRole = await interaction.guild.roles.fetch(value[1].role.id);
                    if (!currentRole) continue;
                    rolesArray.push({
                        label: currentRole.name,
                        value: currentRole.id,
                        description: value[1].description,
                    });
                };
                if (rolesArray.length < 1) return sendMessage(client, interaction, `There are no roles available to be selfassigned in **${interaction.guild.name}**.`);
                let rolesSelects = new Discord.MessageActionRow()
                    .addComponents(new Discord.MessageSelectMenu({ customId: 'role-select', placeholder: 'Click here to drop down!', options: rolesArray }));

                return sendMessage(client, interaction, `Choose a role to assign to yourself: `, null, null, true, rolesSelects);
            };

            // Help menu
            for (let i = 0; i < roleText.length; i++) {
                roleHelpMessage = `${roleHelpMessage}
        > ${i + 1}. <@&${roleText[i]}>`;
            };

            if (roleHelpMessage.length == 0) return sendMessage(client, interaction, `No roles have been made selfassignable yet. Moderators can use \`/addrole\` to add roles to this list.`);

            if (roleHelpMessage.length > embedDescriptionCharacterLimit) return sendMessage(client, interaction, `Embed descriptions can't be over ${embedDescriptionCharacterLimit} characters. Consider removing some roles.`);

            let avatar = client.user.displayAvatarURL(globalVars.displayAvatarSettings);

            const rolesHelp = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor({ name: `Available roles: `, iconURL: avatar })
                .setDescription(roleHelpMessage)
                .setFooter(user.tag)
                .setTimestamp();
            return sendMessage(client, interaction, null, rolesHelp);
        } else {

            // Give role to self through command
            const role = interaction.guild.roles.cache.find(role => role == requestRole);

            let invalidRoleText = `That role does not exist or isn't selfassignable. Use \`/role\` without an argument to see available roles.`;
            if (!role) return sendMessage(client, interaction, invalidRoleText);
            if (!roleIDs.includes(role.id)) return sendMessage(client, interaction, invalidRoleText);
            if (role.managed == true) return sendMessage(client, interaction, `I can't manage the **${role.name}** role because it is being automatically managed by an integration.`);
            if (interaction.guild.me.roles.highest.comparePositionTo(role) <= 0 && !adminBoolBot) return sendMessage(client, interaction, `I can't manage the **${role.name}** role because it is above my highest role.`);

            if (member.roles.cache.has(role.id)) {
                await member.roles.remove(role);
                return sendMessage(client, interaction, `You no longer have the **${role.name}** role, **${member.user.tag}**!`);

            } else {
                await member.roles.add(role);
                return sendMessage(client, interaction, `You now have the **${role.name}** role, **${member.user.tag}**!`);
            };
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "role",
    aliases: ["roles", "rank"],
    description: "Toggles an available role. Use without argument to see roles.",
    options: [{
        name: "role",
        type: "ROLE",
        description: "Specify the role."
    }]
};