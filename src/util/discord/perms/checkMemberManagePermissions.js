import {
    PermissionFlagsBits,
    inlineCode
} from "discord.js";
import formatName from "../formatName.js";
import getEnumName from "../getEnumName.js";

export default ({ interaction, member, action }) => {
    let requiredAction = PermissionFlagsBits.ModerateMembers; // Required for muting

    switch (action) {
        case "ban":
            requiredAction = PermissionFlagsBits.BanMembers;
            break;
        case "kick":
            requiredAction = PermissionFlagsBits.KickMembers;
    };
    let requiredActionName = getEnumName(requiredAction, PermissionFlagsBits);
    let userRole = interaction.member.roles.highest;
    let targetRole = member.roles.highest;
    let botRole = interaction.guild.members.me.roles.highest;
    let usernameFormatted = formatName(member.user.username, true);
    let reasonString = "";
    if (member.id == interaction.user.id) {
        reasonString = `You can not ${action} yourself.`;
    } else if (member.id == interaction.guild.ownerId) {
        reasonString = `I can not ${action} ${usernameFormatted} (${member.id}) because they are the owner of ${formatName(interaction.guild.name, true)}.`;
    } else if (targetRole.position >= botRole.position) {
        reasonString = `I can not ${action} ${usernameFormatted} (${member.id}) because their highest role (${formatName(targetRole.name, true)}) is higher than or equal to mine (${formatName(botRole.name, true)}).`;
    } else if (targetRole.position >= userRole.position && member.id != interaction.guild.ownerId) {
        reasonString = `You can not ${action} ${usernameFormatted} (${member.id}) because their highest role (${formatName(targetRole.name, true)}) is higher than or equal to yours (${formatName(userRole.name, true)}).`;
    } else if (!member.moderatable) {
        reasonString = `I can not ${action} this user. This might be because I lack the ${inlineCode(requiredActionName)} permission.`;
    };
    return reasonString;
};