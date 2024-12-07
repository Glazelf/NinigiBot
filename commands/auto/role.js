import {
    InteractionContextType,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    SlashCommandBuilder,
    SlashCommandStringOption,
    SlashCommandBooleanOption
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import isAdmin from "../../util/discord/perms/isAdmin.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

export default async (interaction, ephemeral) => {
    let serverApi = await import("../../database/dbServices/server.api.js");
    serverApi = await serverApi.default();
    let ephemeralArg = interaction.options.getBoolean("ephemeral");
    if (ephemeralArg !== null) ephemeral = ephemeralArg;
    await interaction.deferReply({ ephemeral: ephemeral });

    let roleArgument = interaction.options.getString('role');
    let requestRole = null;
    if (roleArgument) requestRole = roleArgument;
    let adminBoolBot = isAdmin(interaction.guild.members.me);
    let embedDescriptionCharacterLimit = 4096;
    let selectOptionLimit = 25;

    let db = await serverApi.EligibleRoles.findAll();
    let roles = [];
    let roleIDs = [];
    let roleText = [];
    await db.forEach(eligibleRole => {
        roleIDs.push(eligibleRole.role_id);
    });
    await interaction.guild.roles.cache.each(async (role) => {
        if (roleIDs.includes(role.id)) roleText.push(role);
    });
    const commands = await interaction.client.application.commands.fetch();
    // Role sorting for role help
    roleText = roleText.sort((r, r2) => r2.position - r.position);
    // Role help embed and logic
    let roleHelpMessage = "";
    let rolesArray = [];
    const roleaddCommandName = "roleadd";
    const roleaddCommandId = commands.find(c => c.name == roleaddCommandName)?.id;
    let noRolesString = `No roles have been made selfassignable yet.\nModerators can use </${roleaddCommandName}:${roleaddCommandId}> to add roles to this list.`;
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
                let roleOption = {
                    label: roleOptionName,
                    value: currentRole.id
                };
                if (value[1].description) roleOption.description = value[1].description;
                rolesArray.push(roleOption);
            };
            if (rolesArray.length < 1) return sendMessage({ interaction: interaction, content: noRolesString });

            const roleSelectMenu = new StringSelectMenuBuilder()
                .setCustomId("role-select")
                .setPlaceholder("Click here to drop down!")
                .addOptions(rolesArray)
                .setMaxValues(rolesArray.length);
            let rolesSelects = new ActionRowBuilder()
                .addComponents(roleSelectMenu);

            let returnString = `Choose roles to toggle:`;
            if (ephemeral == true) returnString = `${rolesArray.length}/25 roles before the dropdown is full.\n${removeEmote} You have the role and it will be removed.\n${receiveEmote} You don't have this role yet and it will be added.\n${returnString}`;
            return sendMessage({ interaction: interaction, content: returnString, components: rolesSelects, ephemeral: ephemeral });
        };
        // Help menu
        for (let i = 0; i < roleText.length; i++) {
            // Might want to add descriptions here but you might get character limit issues lol
            roleHelpMessage = `${roleHelpMessage}\n${i + 1}. ${roleText[i]}`;
        };
        if (roleHelpMessage.length == 0) return sendMessage({ interaction: interaction, content: noRolesString });
        if (roleHelpMessage.length > embedDescriptionCharacterLimit) return sendMessage({ interaction: interaction, content: `Embed descriptions can't be over ${embedDescriptionCharacterLimit} characters. Consider removing some roles.` });

        const rolesHelp = new EmbedBuilder()
            .setColor(globalVars.embedColor)
            .setTitle(`Available roles:`)
            .setDescription(roleHelpMessage);
        return sendMessage({ interaction: interaction, embeds: rolesHelp, ephemeral: ephemeral });
    } else {
        const roleCommandName = "role";
        const roleCommandId = commands.find(c => c.name == roleCommandName)?.id;
        let invalidRoleText = `That role does not exist or isn't selfassignable. Use </${roleCommandName}:${roleCommandId}> without any argument to see a drop down menu of available roles.`;
        // Catch because the fetch errors out if the input is not a snowflake, in case of random string inputs.
        try {
            requestRole = await interaction.guild.roles.fetch(requestRole);
        } catch (e) {
            // console.log(e);
            return sendMessage({ interaction: interaction, content: invalidRoleText });
        };
        if (!requestRole || !roleIDs.includes(requestRole.id)) return sendMessage({ interaction: interaction, content: invalidRoleText });
        if (requestRole.managed == true) return sendMessage({ interaction: interaction, content: `I can't manage ${requestRole.name} because it is being automatically managed by an integration.` });
        if (interaction.guild.members.me.roles.highest.comparePositionTo(requestRole) <= 0 && !adminBoolBot) return sendMessage({ interaction: interaction, content: `I can't manage ${requestRole} because it is above my highest role.` });

        let returnString;
        if (interaction.member.roles.cache.has(requestRole.id)) {
            await interaction.member.roles.remove(requestRole);
            returnString = `You no longer have ${requestRole}!`;
        } else {
            await interaction.member.roles.add(requestRole);
            returnString = `You now have ${requestRole}!`;
        };
        return sendMessage({ interaction: interaction, content: returnString });
    };
};

// String options
const roleOption = new SlashCommandStringOption()
    .setName("role")
    .setDescription("Specify the role to toggle.")
    .setAutocomplete(true);
// Boolean options
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Full command
export const commandObject = new SlashCommandBuilder()
    .setName("role")
    .setDescription("Toggles a role. Use without argument to get a full list.")
    .setContexts([InteractionContextType.Guild])
    .addStringOption(roleOption)
    .addBooleanOption(ephemeralOption);