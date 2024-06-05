import Discord from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import isAdmin from "../../util/isAdmin.js";
import getTime from "../../util/getTime.js";

export default async (client, interaction) => {
    try {
        let adminBool = isAdmin(client, interaction.member);
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.KickMembers) && !adminBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        let ephemeral = false;
        await interaction.deferReply({ ephemeral: ephemeral });

        let user = interaction.options.getUser("user");
        let member = interaction.options.getMember("user");
        if (!member) return sendMessage({ client: client, interaction: interaction, content: `Please provide a user to kick.` });

        let kickFailString = `Kick failed. Either the specified user isn't in the server or I lack kicking permissions.`;
        // Check permissions
        let userRole = interaction.member.roles.highest;
        let targetRole = member.roles.highest;
        if (targetRole.position >= userRole.position && interaction.guild.ownerId !== interaction.user.id) return sendMessage({ client: client, interaction: interaction, content: `You don't have a high enough role to kick ${user.username} (${user.id}).` });
        if (!member.kickable) return sendMessage({ client: client, interaction: interaction, content: kickFailString });

        let reason = "Not specified.";
        let reasonArg = interaction.options.getString("reason");
        if (reasonArg) reason = reasonArg;
        let reasonCodeBlock = Discord.codeBlock("fix", reason);

        let time = await getTime(client);
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

export const config = {
    name: "kick",
    description: "Kick a target user from the server.",
    options: [{
        name: "user",
        type: Discord.ApplicationCommandOptionType.User,
        description: "User to kick.",
        required: true
    }, {
        name: "reason",
        type: Discord.ApplicationCommandOptionType.String,
        description: "Reason for kick."
    }]
};