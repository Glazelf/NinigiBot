import {
    InteractionContextType,
    PermissionFlagsBits,
    SlashCommandBuilder,
    SlashCommandRoleOption,
    SlashCommandStringOption,
    bold
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import isAdmin from "../../util/perms/isAdmin.js";

const requiredPermission = PermissionFlagsBits.ManageRoles;
const selectDescriptionCharacterLimit = 50;

export default async (interaction) => {
    let serverApi = await import("../../database/dbServices/server.api.js");
    serverApi = await serverApi.default();
    let adminBoolBot = isAdmin(interaction.guild.members.me);
    let adminBoolUser = isAdmin(interaction.member);
    if (!interaction.member.permissions.has(requiredPermission) && !adminBoolUser) return sendMessage({ interaction: interaction, content: globalVars.lackPermsString });

    let ephemeral = true;
    await interaction.deferReply({ ephemeral: ephemeral });

    let role = interaction.options.getRole("role");
    let description = null;
    let descriptionArg = interaction.options.getString("description");
    if (descriptionArg) {
        description = descriptionArg;
        if (description.length > selectDescriptionCharacterLimit) return sendMessage({ interaction: interaction, content: `Role description must be ${selectDescriptionCharacterLimit} characters or less.` });
    };

    if (role.managed == true) return sendMessage({ interaction: interaction, content: `I can't manage the ${bold(role.name)} role because it is being automatically managed by an integration.` });
    if (interaction.guild.members.me.roles.highest.comparePositionTo(role) <= 0 && !adminBoolBot) return sendMessage({ interaction: interaction, content: `I can't manage the ${bold(role.name)} role because it is above my highest role.` });
    if (interaction.member.roles.highest.comparePositionTo(role) <= 0 && !adminBoolUser) return sendMessage({ interaction: interaction, content: `You don't have a high enough role to make the ${bold(role.name)} role selfassignable.` });

    let roleIDs = await serverApi.EligibleRoles.findAll({ where: { role_id: role.id } });
    if (roleIDs.length > 0) {
        for await (const roleID of roleIDs) {
            roleID.destroy();
        };
        return sendMessage({ interaction: interaction, content: `${role} is no longer eligible to be selfassigned.` });
    } else {
        if (description) {
            await serverApi.EligibleRoles.upsert({ role_id: role.id, name: role.name, description: description });
        } else {
            await serverApi.EligibleRoles.upsert({ role_id: role.id, name: role.name });
        };
        return sendMessage({ interaction: interaction, content: `${role} is now eligible to be selfassigned.` });
    };
};

// String options
const descriptionOption = new SlashCommandStringOption()
    .setName("description")
    .setDescription("Specify a description for the role.")
    .setMaxLength(50);
// Role options
const roleOption = new SlashCommandRoleOption()
    .setName("role")
    .setDescription("Specify role to toggle.")
    .setRequired(true);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("roleadd")
    .setDescription("Toggle a role's eligibility to be selfassigned.")
    .setContexts([InteractionContextType.Guild])
    .setDefaultMemberPermissions(requiredPermission)
    .addRoleOption(roleOption)
    .addStringOption(descriptionOption);