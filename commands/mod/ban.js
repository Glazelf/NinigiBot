import {
    InteractionContextType,
    PermissionFlagsBits,
    codeBlock,
    SlashCommandBuilder,
    SlashCommandIntegerOption,
    SlashCommandStringOption,
    SlashCommandSubcommandBuilder,
    SlashCommandUserOption,
    userMention,
    bold
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import isAdmin from "../../util/perms/isAdmin.js";
import getTime from "../../util/getTime.js";
import getPermissionName from "../../util/discord/getPermissionName.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

const requiredPermission = PermissionFlagsBits.BanMembers;
const requiredPermissionName = getPermissionName(requiredPermission);

export default async (interaction) => {
    let adminBool = isAdmin(interaction.member);
    if (!interaction.member.permissions.has(requiredPermission) && !adminBool) return sendMessage({ interaction: interaction, content: globalVars.lackPermsString });

    let ephemeral = false;
    await interaction.deferReply({ ephemeral: ephemeral });

    let user = interaction.options.getUser("user");
    let member = interaction.options.getMember("user");
    let userIDArg = interaction.options.getString("user-id");
    if (user && !userIDArg) userIDArg = user.id;
    let reason = interaction.options.getString("reason");
    if (!reason) reason = `Not specified.`;
    let reasonCodeBlock = codeBlock("fix", reason);
    let deleteMessageDays = 0;
    let deleteMessageDaysArg = interaction.options.getInteger("delete-messages-days");
    if (deleteMessageDaysArg) deleteMessageDays = deleteMessageDaysArg;
    let deletedMessagesString = `\nDeleted messages by banned user from the last ${deleteMessageDays} day(s).`;
    let deleteMessageSeconds = deleteMessageDays * 86400; // Why is this in seconds now??

    let banReturn = null;
    let banFailString = `Ban failed. Either the specified user isn't in the server or I lack the \`${requiredPermissionName}\` permission.`;
    let dmString = `You've been banned from ${bold(interaction.guild.name)} by ${bold(interaction.user.username)} for the following reason: ${reasonCodeBlock}`;

    let bansFetch = null;
    try {
        bansFetch = await interaction.guild.bans.fetch();
    } catch (e) {
        // console.log(e);
        bansFetch = null;
    };
    let time = getTime();
    let reasonInfo = `-${interaction.user.username} (${time})`;
    // If member is found
    if (member) {
        // Check permissions
        let userRole = interaction.member.roles.highest;
        let targetRole = member.roles.highest;
        let botRole = interaction.guild.members.me.roles.highest;
        if (targetRole.position >= userRole.position && interaction.guild.ownerId !== interaction.user.id) return sendMessage({ interaction: interaction, content: `You can not ban ${bold(user.username)} (${member.id}) because their highest role (${bold(targetRole.name)}) is higher than yours (${bold(userRole.name)}).` });
        if (targetRole.position >= botRole.position) return sendMessage({ interaction: interaction, content: `I can not ban ${bold(user.username)} (${user.id}) because their highest role (${bold(targetRole.name)}) is higher than mine (${bold(botRole.name)}).` });
        if (!member.bannable) return sendMessage({ interaction: interaction, content: banFailString });
        // See if target isn't already banned
        if (bansFetch && bansFetch.has(member.id)) return sendMessage({ interaction: interaction, content: `${bold(user.username)} (${member.id}) is already banned.` });
        banReturn = `Banned ${user} (${member.id}) for the following reason: ${reasonCodeBlock}`;
        await user.send({ content: dmString })
            .then(message => banReturn += `Succeeded in sending a DM to ${bold(user.username)} with the reason.`)
            .catch(e => banReturn += `Failed to send a DM to ${bold(user.username)} with the reason.`);
        if (deleteMessageSeconds > 0) banReturn += deletedMessagesString;
        try {
            await member.ban({ reason: `${reason} ${reasonInfo}`, deleteMessageSeconds: deleteMessageSeconds });
            return sendMessage({ interaction: interaction, content: banReturn, ephemeral: ephemeral });
        } catch (e) {
            // console.log(e);
            return sendMessage({ interaction: interaction, content: banFailString });
        };
    } else if (userIDArg) {
        // Try to ban by ID ("hackban") instead
        // See if target isn't already banned
        if (bansFetch && bansFetch.has(userIDArg)) return sendMessage({ interaction: interaction, content: `${userMention(userIDArg)} (${userIDArg}) is already banned.` });
        banReturn = `Banned ${userMention(userIDArg)} (${userIDArg}) for the following reason: ${reasonCodeBlock}No DM was sent since this ban was by ID or the user was not in the server.`;
        if (deleteMessageSeconds > 0) banReturn += deletedMessagesString;
        try {
            await interaction.guild.members.ban(userIDArg, { reason: `${reason} ${reasonInfo}`, deleteMessageSeconds: deleteMessageSeconds });
            return sendMessage({ interaction: interaction, content: banReturn, ephemeral: ephemeral });
        } catch (e) {
            // console.log(e);
            return sendMessage({ interaction: interaction, content: banFailString });
        };
    } else {
        return sendMessage({ interaction: interaction, content: `You need to provide a target to ban either through the \`member\` or the \`user-id\` argument.` });
    };
};

// String options
const userIDOption = new SlashCommandStringOption()
    .setName("user-id")
    .setDescription("User ID to ban.")
    .setRequired(true);
const reasonOption = new SlashCommandStringOption()
    .setName("reason")
    .setDescription("Reason for ban.")
    .setMaxLength(450); // Max reason length is 512, leave some space for executor and timestamp
// Integer options
const deleteMessageDaysOption = new SlashCommandIntegerOption()
    .setName("delete-messages-days")
    .setDescription("Amount of days to delete messages for.")
    .setMinValue(0)
    .setMaxValue(7);
// User options
const userOption = new SlashCommandUserOption()
    .setName("user")
    .setDescription("User to ban.")
    .setRequired(true);
// Subcommands
const userSubcommand = new SlashCommandSubcommandBuilder()
    .setName("user")
    .setDescription("Ban a user.")
    .addUserOption(userOption)
    .addStringOption(reasonOption)
    .addIntegerOption(deleteMessageDaysOption);
const userIDSubcommand = new SlashCommandSubcommandBuilder()
    .setName("user-id")
    .setDescription("Ban user by ID.")
    .addStringOption(userIDOption)
    .addStringOption(reasonOption)
    .addIntegerOption(deleteMessageDaysOption);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban target user.")
    .setContexts([InteractionContextType.Guild])
    .setDefaultMemberPermissions(requiredPermission)
    .addSubcommand(userSubcommand)
    .addSubcommand(userIDSubcommand);