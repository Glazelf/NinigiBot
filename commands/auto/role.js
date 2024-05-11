const Discord = require("discord.js");
exports.run = async (client, interaction, logger, ephemeral = true) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require("../../util/isAdmin");
        const { EligibleRoles } = require('../../database/dbServices/server.api');

        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg !== null) ephemeral = ephemeralArg;
        await interaction.deferReply({ ephemeral: ephemeral });

        await interaction.guild.roles.fetch();

        let roleArgument = interaction.options.getString('role');
        let requestRole = null;
        if (roleArgument) requestRole = roleArgument;
        let adminBoolBot = isAdmin(client, interaction.guild.members.me);
        let embedDescriptionCharacterLimit = 4096;
        let selectOptionLimit = 25;

        let db = await EligibleRoles.findAll();
        let roles = [];
        let roleIDs = [];
        let roleText = [];
        await db.forEach(eligibleRole => {
            roleIDs.push(eligibleRole.role_id);
        });
        await interaction.guild.roles.cache.each(async (role) => {
            if (roleIDs.includes(role.id)) {
                roleText.push(role);
            };
        });
        // Role sorting for role help
        roleText = roleText.sort((r, r2) => r2.position - r.position);
        // Role help embed and logic
        let roleHelpMessage = "";
        let rolesArray = [];
        let noRolesString = `No roles have been made selfassignable yet. Moderators can use </roleadd:978076328567926834> to add roles to this list.`; // Make ID adaptive
        let receiveEmote = "❌";
        let removeEmote = "✅";
        if (!requestRole) {
            // Select Menu
            if (roleText.length <= selectOptionLimit) {
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
                    let roleOptionName = currentRole.name;
                    if (ephemeral && interaction.member.roles.cache.has(currentRole.id)) {
                        roleOptionName = `${removeEmote} ${roleOptionName}`;
                    } else if (ephemeral) {
                        roleOptionName = `${receiveEmote} ${roleOptionName}`;
                    };
                    rolesArray.push({
                        label: roleOptionName,
                        value: currentRole.id,
                        description: value[1].description,
                    });
                };
                if (rolesArray.length < 1) return sendMessage({ client: client, interaction: interaction, content: noRolesString });

                let rolesSelects = new Discord.ActionRowBuilder()
                    .addComponents(new Discord.SelectMenuBuilder({ customId: 'role-select', placeholder: 'Click here to drop down!', options: rolesArray, maxValues: rolesArray.length }));

                let returnString = `Choose roles to toggle:`;
                if (ephemeral == true) returnString = `${rolesArray.length}/25 roles before the dropdown is full.\n${removeEmote} You have the role and it will be removed.\n${receiveEmote} You don't have this role yet and it will be added.\n${returnString}`;
                return sendMessage({ client: client, interaction: interaction, content: returnString, components: rolesSelects, ephemeral: ephemeral });
            };
            // Help menu
            for (let i = 0; i < roleText.length; i++) {
                // Might want to add descriptions here but you might get character limit issues lol
                roleHelpMessage = `${roleHelpMessage}\n${i + 1}. ${roleText[i]}`;
            };
            if (roleHelpMessage.length == 0) return sendMessage({ client: client, interaction: interaction, content: noRolesString });
            if (roleHelpMessage.length > embedDescriptionCharacterLimit) return sendMessage({ client: client, interaction: interaction, content: `Embed descriptions can't be over ${embedDescriptionCharacterLimit} characters. Consider removing some roles.` });

            const rolesHelp = new Discord.EmbedBuilder()
                .setColor(client.globalVars.embedColor)
                .setTitle(`Available roles:`)
                .setDescription(roleHelpMessage);
            return sendMessage({ client: client, interaction: interaction, embeds: rolesHelp, ephemeral: ephemeral });
        } else {
            let invalidRoleText = `That role does not exist or isn't selfassignable. Use </role:978075106276429864> without any argument to see a drop down menu of available roles.`; // Make ID adaptive
            requestRole = await interaction.guild.roles.fetch(requestRole);
            if (!requestRole || !roleIDs.includes(requestRole.id)) return sendMessage({ client: client, interaction: interaction, content: invalidRoleText });
            if (requestRole.managed == true) return sendMessage({ client: client, interaction: interaction, content: `I can't manage ${requestRole.name} because it is being automatically managed by an integration.` });
            if (interaction.guild.members.me.roles.highest.comparePositionTo(requestRole) <= 0 && !adminBoolBot) return sendMessage({ client: client, interaction: interaction, content: `I can't manage ${requestRole} because it is above my highest role.` });

            let returnString;
            if (interaction.member.roles.cache.has(requestRole.id)) {
                await interaction.member.roles.remove(requestRole);
                returnString = `You no longer have ${requestRole}!`;
            } else {
                await interaction.member.roles.add(requestRole);
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
        type: Discord.ApplicationCommandOptionType.String,
        description: "Specify the role to toggle.",
        autocomplete: true
    }, {
        name: "ephemeral",
        type: Discord.ApplicationCommandOptionType.Boolean,
        description: "Whether the reply will be private."
    }]
};