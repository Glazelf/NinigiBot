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
        let user = interaction.user;

        let ephemeral = true;
        let ephemeralArg = args.find(element => element.name == "ephemeral");
        if (ephemeralArg) ephemeral = ephemeralArg.value;

        let roleArgument = args.find(element => element.name == 'role');
        let requestRole = null;
        if (roleArgument) requestRole = roleArgument.role;
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
        let noRolesString = `No roles have been made selfassignable yet. Moderators can use \`/addrole\` to add roles to this list.`;

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
                if (rolesArray.length < 1) return sendMessage({ client: client, interaction: interaction, content: noRolesString });

                let rolesSelects = new Discord.MessageActionRow()
                    .addComponents(new Discord.MessageSelectMenu({ customId: 'role-select', placeholder: 'Click here to drop down!', options: rolesArray }));

                return sendMessage({ client: client, interaction: interaction, content: `Choose a role to assign to yourself: `, components: rolesSelects, ephemeral: ephemeral });
            };

            // Help menu
            for (let i = 0; i < roleText.length; i++) {
                roleHelpMessage = `${roleHelpMessage}
        > ${i + 1}. <@&${roleText[i]}>`;
            };

            if (roleHelpMessage.length == 0) return sendMessage({ client: client, interaction: interaction, content: noRolesString });

            if (roleHelpMessage.length > embedDescriptionCharacterLimit) return sendMessage({ client: client, interaction: interaction, content: `Embed descriptions can't be over ${embedDescriptionCharacterLimit} characters. Consider removing some roles.` });

            let avatar = client.user.displayAvatarURL(globalVars.displayAvatarSettings);

            const rolesHelp = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor({ name: `Available roles: `, iconURL: avatar })
                .setDescription(roleHelpMessage);
            return sendMessage({ client: client, interaction: interaction, embeds: rolesHelp, ephemeral: ephemeral });
        } else {
            let invalidRoleText = `That role does not exist or isn't selfassignable. Use \`/role\` without any argument to see a drop down menu of available roles.`;
            if (!requestRole || !roleIDs.includes(requestRole.id)) return sendMessage({ client: client, interaction: interaction, content: invalidRoleText });
            if (requestRole.managed == true) return sendMessage({ client: client, interaction: interaction, content: `I can't manage ${requestRole.name} because it is being automatically managed by an integration.` });
            if (interaction.guild.me.roles.highest.comparePositionTo(requestRole) <= 0 && !adminBoolBot) return sendMessage({ client: client, interaction: interaction, content: `I can't manage ${requestRole} because it is above my highest role.` });

            let returnString;
            if (member.roles.cache.has(requestRole.id)) {
                await member.roles.remove(requestRole);
                returnString = `You no longer have ${requestRole}!`;
            } else {
                await member.roles.add(requestRole);
                returnString = `You now have ${requestRole}!`;
            };
            return sendMessage({ client: client, interaction: interaction, content: returnString });
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "role",
    description: "Toggles a role. Use without argument to get a full list.",
    options: [{
        name: "role",
        type: "ROLE",
        description: "Specify the role."
    }, {
        name: "ephemeral",
        type: "BOOLEAN",
        description: "Whether this command is only visible to you."
    }]
};