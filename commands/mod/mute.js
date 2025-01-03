import {
    MessageFlags,
    InteractionContextType,
    PermissionFlagsBits,
    codeBlock,
    SlashCommandBuilder,
    SlashCommandStringOption,
    SlashCommandIntegerOption,
    SlashCommandUserOption,
    bold,
    inlineCode
} from "discord.js";
import sendMessage from "../../util/discord/sendMessage.js";
import isAdmin from "../../util/discord/perms/isAdmin.js";
import getTime from "../../util/getTime.js";
import getPermissionName from "../../util/discord/getPermissionName.js";
import formatName from "../../util/discord/formatName.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

const requiredPermission = PermissionFlagsBits.ModerateMembers;
const requiredPermissionName = getPermissionName(requiredPermission);

export default async (interaction, messageFlags) => {
    let adminBool = isAdmin(interaction.member);
    if (!interaction.member.permissions.has(requiredPermission) && !adminBool) return sendMessage({ interaction: interaction, content: globalVars.lackPermsString, flags: messageFlags.add(MessageFlags.Ephemeral) });

    await interaction.deferReply();

    let user = interaction.options.getUser("user");
    let member = await interaction.guild.members.fetch(user.id);
    if (!member) return sendMessage({ interaction: interaction, content: `Please provide a user to mute.` });

    let muteTime = 60;
    let maxMuteTime = 2419200000; // Max time is 28 days
    let timeArg = interaction.options.getInteger("time");
    if (timeArg) muteTime = timeArg;
    if (isNaN(muteTime) || 1 > muteTime) return sendMessage({ interaction: interaction, content: `Please provide a valid number.` });
    muteTime = muteTime * 1000 * 60; // Convert to milliseconds
    if (muteTime > maxMuteTime) muteTime = maxMuteTime;
    // Format display time
    let displayMuteTime = muteTime / 1000 / 60; // Convert display back to minutes
    let daysMuted = Math.floor(displayMuteTime / 1440); // Simple divide since it's the largest unit
    let hoursMuted = Math.floor((displayMuteTime / 60) - daysMuted * 24);
    let minutesMuted = Math.floor(displayMuteTime - hoursMuted * 60 - daysMuted * 60 * 24);
    let daysMutedDisplay = daysMuted > 0 ? daysMuted + (daysMuted == 1 ? " day " : " days ") : "";
    let hoursMutedDisplay = hoursMuted > 0 ? hoursMuted + (hoursMuted == 1 ? " hour " : " hours ") : "";
    let minutesMutedDisplay = minutesMuted > 0 ? minutesMuted + (minutesMuted == 1 ? " minute " : " minutes ") : "";
    displayMuteTime = daysMutedDisplay + hoursMutedDisplay + minutesMutedDisplay;

    if (!member) return sendMessage({ interaction: interaction, content: `Please use a proper mention if you want to mute someone.` });
    // Check permissions
    let userRole = interaction.member.roles.highest;
    let targetRole = member.roles.highest;
    let botRole = interaction.guild.members.me.roles.highest;
    let usernameFormatted = formatName(user.username);
    if (targetRole.position >= userRole.position && interaction.guild.ownerId !== interaction.user.id) return sendMessage({ interaction: interaction, content: `You can not mute ${usernameFormatted} because their highest role (${formatName(targetRole.name)}) is higher than yours (${formatName(userRole.name)}).` });
    if (targetRole.position >= botRole.position) return sendMessage({ interaction: interaction, content: `I can not mute ${usernameFormatted} because their highest role (${formatName(targetRole.name)}) is higher than mine (${formatName(botRole.name)}).` });
    if (!member.moderatable) return sendMessage({ interaction: interaction, content: `I can not mute this user, I lack the ${inlineCode(requiredPermissionName)} permission.` });

    let reason = "Not specified.";
    let reasonArg = interaction.options.getString("reason");
    if (reasonArg) reason = reasonArg;
    let reasonCodeBlock = codeBlock("fix", reason);

    let muteReturnString = `Muted ${member} (${member.id}) for ${displayMuteTime}for the following reason: ${reasonCodeBlock}`;
    if (member.communicationDisabledUntil) { // Check if a timeout timestamp exists
        if (member.communicationDisabledUntil > Date.now()) { // Only attempt to unmute if said timestamp is in the future, if not we can just override it
            muteTime = null;
            muteReturnString = `Unmuted ${user.username} (${member.id}).\n`;
        };
    };
    let time = getTime();
    let reasonInfo = `-${interaction.user.username} (${time})`;
    let dmString = `You got muted in ${formatName(interaction.guild.name)} for ${bold(displayMuteTime)} by ${formatName(interaction.user.username)} for the following reason: ${reasonCodeBlock}`;
    // Timeout logic
    try {
        await member.timeout(muteTime, `${reason} ${reasonInfo}`);
        await user.send({ content: dmString })
            .then(message => muteReturnString += `Succeeded in sending a DM to ${usernameFormatted} with the reason.`)
            .catch(e => muteReturnString += `Failed to send a DM to ${usernameFormatted} with the reason.`);
        return sendMessage({ interaction: interaction, content: muteReturnString });
    } catch (e) {
        // console.log(e);
        return sendMessage({ interaction: interaction, content: `Failed to toggle timeout on ${usernameFormatted}. I probably lack permissions.` });
    };
};


// String options
const reasonOption = new SlashCommandStringOption()
    .setName("reason")
    .setDescription("Reason for mute.")
    .setMaxLength(450); // Max reason length is 512, leave some space for executor and timestamp
// Integer options
const timeOption = new SlashCommandIntegerOption()
    .setName("time")
    .setDescription("Amount of time to mute in minutes.")
    .setAutocomplete(true)
    .setRequired(true)
    .setMinValue(1)
    .setMaxValue(43800);
// User options
const userOption = new SlashCommandUserOption()
    .setName("user")
    .setDescription("User to time out.")
    .setRequired(true);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Times the target out.")
    .setContexts([InteractionContextType.Guild])
    .setDefaultMemberPermissions(requiredPermission)
    .addUserOption(userOption)
    .addIntegerOption(timeOption)
    .addStringOption(reasonOption);