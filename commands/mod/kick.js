import {
    PermissionFlagsBits,
    codeBlock,
    SlashCommandBuilder,
    SlashCommandStringOption,
    SlashCommandUserOption
} from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import isAdmin from "../../util/isAdmin.js";
import getTime from "../../util/getTime.js";

const requiredPermission = PermissionFlagsBits.KickMembers;

export default async (client, interaction) => {
    try {
        if (!interaction.inGuild()) return sendMessage({ client: client, interaction: interaction, content: globalVars.guildRequiredString });
        let adminBool = isAdmin(client, interaction.member);
        if (!interaction.member.permissions.has(requiredPermission) && !adminBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPermsString });

        let ephemeral = false;
        await interaction.deferReply({ ephemeral: ephemeral });

        let user = interaction.options.getUser("member");
        let member = interaction.options.getMember("member");
        if (!member) return sendMessage({ client: client, interaction: interaction, content: `Please provide a member to kick.` });

        let kickFailString = `Kick failed. Either the specified user isn't in the server or I lack kicking permissions.`;
        // Check permissions
        let userRole = interaction.member.roles.highest;
        let targetRole = member.roles.highest;
        if (targetRole.position >= userRole.position && interaction.guild.ownerId !== interaction.user.id) return sendMessage({ client: client, interaction: interaction, content: `You don't have a high enough role to kick ${user.username} (${user.id}).` });
        if (!member.kickable) return sendMessage({ client: client, interaction: interaction, content: kickFailString });

        let reason = "Not specified.";
        let reasonArg = interaction.options.getString("reason");
        if (reasonArg) reason = reasonArg;
        let reasonCodeBlock = codeBlock("fix", reason);

        let time = getTime();
        let reasonInfo = `-${interaction.user.username} (${time})`;
        // Kick
        let kickReturn = `Kicked ${user} (${user.id}) for the following reason: ${reasonCodeBlock}`;
        await user.send({ content: `You've been kicked from **${interaction.guild.name}** by ${interaction.user.username} for the following reason: ${reasonCodeBlock}` })
            .then(message => kickReturn += `Succeeded in sending a DM to ${user.username} with the reason.`)
            .catch(e => kickReturn += `Failed to send a DM to ${user.username} with the reason.`);
        try {
            await member.kick([`${reason} ${reasonInfo}`]);
            return sendMessage({ client: client, interaction: interaction, content: kickReturn, ephemeral: ephemeral });
        } catch (e) {
            // console.log(e);
            if (e.toString().includes("Missing Permissions")) {
                return logger(e, client, interaction);
            } else {
                return sendMessage({ client: client, interaction: interaction, content: kickFailString });
            };
        };

    } catch (e) {
        logger(e, client, interaction);
    };
};

// String options
const reasonOption = new SlashCommandStringOption()
    .setName("reason")
    .setDescription("Reason for kick.");
// User options
const memberOption = new SlashCommandUserOption()
    .setName("member")
    .setDescription("Member to kick")
    .setRequired(true);
// Final command
export const config = new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member from the server.");