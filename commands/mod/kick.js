import {
    InteractionContextType,
    PermissionFlagsBits,
    codeBlock,
    SlashCommandBuilder,
    SlashCommandStringOption,
    SlashCommandUserOption
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import isAdmin from "../../util/discord/perms/isAdmin.js";
import getTime from "../../util/getTime.js";
import getPermissionName from "../../util/discord/getPermissionName.js";
import formatName from "../../util/discord/formatName.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

const requiredPermission = PermissionFlagsBits.KickMembers;
const requiredPermissionName = getPermissionName(requiredPermission);

export default async (interaction) => {
    let adminBool = isAdmin(interaction.member);
    if (!interaction.member.permissions.has(requiredPermission) && !adminBool) return sendMessage({ interaction: interaction, content: globalVars.lackPermsString });

    let ephemeral = false;
    await interaction.deferReply({ ephemeral: ephemeral });

    let user = interaction.options.getUser("user");
    let member = interaction.options.getMember("user");
    if (!member) return sendMessage({ interaction: interaction, content: `Please provide a member to kick.` });
    let usernameFormatted = formatName(user.username);
    let executorNameFormatted = formatName(interaction.user.username);

    let kickFailString = `Kick failed. Either the specified user isn't in the server or I lack the \`${requiredPermissionName}\` permission.`;
    // Check permissions
    let userRole = interaction.member.roles.highest;
    let targetRole = member.roles.highest;
    let botRole = interaction.guild.members.me.roles.highest;
    if (targetRole.position >= userRole.position && interaction.guild.ownerId !== interaction.user.id) return sendMessage({ interaction: interaction, content: `You can not kick ${usernameFormatted} (${user.id}) because their highest role (${formatName(targetRole.name)}) is higher than yours (${formatName(userRole.name)}).` });
    if (targetRole.position >= botRole.position) return sendMessage({ interaction: interaction, content: `I can not kick ${usernameFormatted} (${user.id}) because their highest role (${formatName(targetRole.name)}) is higher than mine (${formatName(botRole.name)}).` });
    if (!member.kickable) return sendMessage({ interaction: interaction, content: kickFailString });

    let reason = "Not specified.";
    let reasonArg = interaction.options.getString("reason");
    if (reasonArg) reason = reasonArg;
    let reasonCodeBlock = codeBlock("fix", reason);

    let time = getTime();
    let reasonInfo = `-${interaction.user.username} (${time})`;
    // Kick
    let kickReturn = `Kicked ${user} (${user.id}) for the following reason: ${reasonCodeBlock}`;
    await user.send({ content: `You've been kicked from ${formatName(interaction.guild.name)} by ${executorNameFormatted} for the following reason: ${reasonCodeBlock}` })
        .then(message => kickReturn += `Succeeded in sending a DM to ${usernameFormatted} with the reason.`)
        .catch(e => kickReturn += `Failed to send a DM to ${usernameFormatted} with the reason.`);
    try {
        await member.kick([`${reason} ${reasonInfo}`]);
        return sendMessage({ interaction: interaction, content: kickReturn, ephemeral: ephemeral });
    } catch (e) {
        return sendMessage({ interaction: interaction, content: kickFailString });
    };
};

// String options
const reasonOption = new SlashCommandStringOption()
    .setName("reason")
    .setDescription("Reason for kick.")
    .setMaxLength(450); // Max reason length is 512, leave some space for executor and timestamp
// User options
const userOption = new SlashCommandUserOption()
    .setName("user")
    .setDescription("User to kick")
    .setRequired(true);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user from the server.")
    .setContexts([InteractionContextType.Guild])
    .setDefaultMemberPermissions(requiredPermission)
    .addUserOption(userOption)
    .addStringOption(reasonOption);