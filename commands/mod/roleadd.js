import Discord from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import isAdmin from "../../util/isAdmin.js";

export default async (client, interaction) => {
    try {
        let serverApi = await import("../../database/dbServices/server.api.js");
        serverApi = await serverApi.default();
        let adminBoolBot = isAdmin(client, interaction.guild.members.me);
        let adminBoolUser = isAdmin(client, interaction.member);
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageRoles) && !adminBoolUser) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        let ephemeral = true;
        await interaction.deferReply({ ephemeral: ephemeral });

        let role = interaction.options.getRole("role");
        let description = null;
        let descriptionArg = interaction.options.getString("description");
        let selectDescriptionCharacterLimit = 50;
        if (descriptionArg) {
            description = descriptionArg;
            if (description.length > selectDescriptionCharacterLimit) return sendMessage({ client: client, interaction: interaction, content: `Role description must be ${selectDescriptionCharacterLimit} characters or less.` });
        };

        if (role.managed == true) return sendMessage({ client: client, interaction: interaction, content: `I can't manage the **${role.name}** role because it is being automatically managed by an integration.` });
        if (interaction.guild.members.me.roles.highest.comparePositionTo(role) <= 0 && !adminBoolBot) return sendMessage({ client: client, interaction: interaction, content: `I can't manage the **${role.name}** role because it is above my highest role.` });
        if (interaction.member.roles.highest.comparePositionTo(role) <= 0 && !adminBoolUser) return sendMessage({ client: client, interaction: interaction, content: `You don't have a high enough role to make the **${role.name}** role selfassignable.` });

        let roleIDs = await serverApi.EligibleRoles.findAll({ where: { role_id: role.id } });
        if (roleIDs.length > 0) {
            for await (const roleID of roleIDs) {
                roleID.destroy();
            };
            return sendMessage({ client: client, interaction: interaction, content: `${role} is no longer eligible to be selfassigned.` });
        } else {
            if (description) {
                await serverApi.EligibleRoles.upsert({ role_id: role.id, name: role.name, description: description });
            } else {
                await serverApi.EligibleRoles.upsert({ role_id: role.id, name: role.name });
            };
            return sendMessage({ client: client, interaction: interaction, content: `${role} is now eligible to be selfassigned.` });
        };

    } catch (e) {
        logger(e, client, interaction);
    };
};

export const config = {
    name: "roleadd",
    description: "Toggle a role's eligibility to be selfassigned.",
    options: [{
        name: "role",
        type: Discord.ApplicationCommandOptionType.Role,
        description: "Specify role to toggle.",
        required: true
    }, {
        name: "description",
        type: Discord.ApplicationCommandOptionType.String,
        description: "Specify a description for the role."
    }]
};