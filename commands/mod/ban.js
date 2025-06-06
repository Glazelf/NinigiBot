import {
    MessageFlags,
    InteractionContextType,
    PermissionFlagsBits,
    codeBlock,
    inlineCode,
    userMention,
    SlashCommandBuilder,
    SlashCommandIntegerOption,
    SlashCommandStringOption,
    SlashCommandSubcommandBuilder,
    SlashCommandUserOption
} from "discord.js";
import sendMessage from "../../util/discord/sendMessage.js";
import checkMemberManagePermissions from "../../util/discord/perms/checkMemberManagePermissions.js";
import isAdmin from "../../util/discord/perms/isAdmin.js";
import getTime from "../../util/getTime.js";
import getEnumName from "../../util/discord/getEnumName.js";
import formatName from "../../util/discord/formatName.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

const requiredPermission = PermissionFlagsBits.BanMembers;
const requiredPermissionName = getEnumName(requiredPermission, PermissionFlagsBits);

export default async (interaction, messageFlags) => {
    let adminBool = isAdmin(interaction.member);
    if (!interaction.member.permissions.has(requiredPermission) && !adminBool) return sendMessage({ interaction: interaction, content: globalVars.lackPermsString, flags: messageFlags.add(MessageFlags.Ephemeral) });

    messageFlags.remove(MessageFlags.Ephemeral);
    await interaction.deferReply({ flags: messageFlags });

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
    let deleteMessageSeconds = deleteMessageDays * 86_400; // Why is this in seconds now??

    let executorNameFormatted = formatName(interaction.user.username, true);
    let banReturn = null;
    let banFailString = `Ban failed. This might be because the specified user isn not in the server or I lack the ${inlineCode(requiredPermissionName)} permission.`;
    let dmString = `You've been banned from ${formatName(interaction.guild.name, true)} by ${executorNameFormatted} for the following reason: ${reasonCodeBlock}`;

    let bansFetch = await interaction.guild.bans.fetch().catch(e => { return null; });
    let time = getTime();
    let reasonInfo = `-${formatName(interaction.user.username, false)} (${time})`;
    // If member is found
    if (member) {
        let usernameFormatted = formatName(user.username, true);
        // Check permissions
        let memberManageNoPermissionString = checkMemberManagePermissions({ interaction: interaction, member: member, action: "mute" });
        if (memberManageNoPermissionString.length > 0) return sendMessage({ interaction: interaction, content: memberManageNoPermissionString });
        if (!member.bannable) return sendMessage({ interaction: interaction, content: banFailString });
        // See if target isn't already banned
        if (bansFetch && bansFetch.has(member.id)) return sendMessage({ interaction: interaction, content: `${usernameFormatted} (${member.id}) is already banned.` });
        banReturn = `Banned ${user} (${member.id}) for the following reason: ${reasonCodeBlock}`;
        await user.send({ content: dmString })
            .then(message => banReturn += `Succeeded in sending a DM to ${usernameFormatted} with the reason.`)
            .catch(e => banReturn += `Failed to send a DM to ${usernameFormatted} with the reason.`);
        if (deleteMessageSeconds > 0) banReturn += deletedMessagesString;
        try {
            await member.ban({ reason: `${reason} ${reasonInfo}`, deleteMessageSeconds: deleteMessageSeconds });
            return sendMessage({ interaction: interaction, content: banReturn });
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
            return sendMessage({ interaction: interaction, content: banReturn });
        } catch (e) {
            // console.log(e);
            return sendMessage({ interaction: interaction, content: banFailString });
        };
    } else {
        return sendMessage({ interaction: interaction, content: `You need to provide a target to ban either through the ${inlineCode("member")} or the ${inlineCode("user-id")} argument.` });
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