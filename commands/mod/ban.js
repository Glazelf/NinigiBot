import Discord from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import isAdmin from "../../util/isAdmin.js";
import getTime from "../../util/getTime.js";

export default async (client, interaction) => {
    try {
        let adminBool = isAdmin(client, interaction.member);
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.BanMembers) && !adminBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        let ephemeral = false;
        await interaction.deferReply({ ephemeral: ephemeral });

        let user = interaction.options.getUser("user");
        let member = interaction.options.getMember("user");
        let userIDArg = interaction.options.getString("user-id");
        if (user && !userIDArg) userIDArg = user.id;
        let reason = interaction.options.getString("reason");
        if (!reason) reason = `Not specified.`;
        let reasonCodeBlock = Discord.codeBlock("fix", reason);
        let deleteMessageDays = 0;
        let deleteMessageDaysArg = interaction.options.getInteger("delete-messages-days");
        if (deleteMessageDaysArg) deleteMessageDays = deleteMessageDaysArg;
        if (deleteMessageDays < 0) deleteMessageDays = 0;
        if (deleteMessageDays > 7) deleteMessageDays = 7;
        let deletedMessagesString = `\nDeleted messages by banned user from the last ${deleteMessageDays} day(s).`;
        let deleteMessageSeconds = deleteMessageDays * 86400; // Why is this in seconds now??

        let banReturn = null;
        let banFailString = `Ban failed. Either the specified user isn't in the server or I lack banning permissions.`;
        let dmString = `You've been banned from **${interaction.guild.name}** by ${interaction.user.username} for the following reason: ${reasonCodeBlock}`;

        let bansFetch;
        try {
            bansFetch = await interaction.guild.bans.fetch();
        } catch (e) {
            // console.log(e);
            bansFetch = null;
        };
        let time = await getTime(client);
        let reasonInfo = `-${interaction.user.username} (${time})`;
        // If member is found
        if (member) {
            // Check permissions
            let userRole = interaction.member.roles.highest;
            let targetRole = member.roles.highest;
            if (targetRole.position >= userRole.position && interaction.guild.ownerId !== interaction.user.id) return sendMessage({ client: client, interaction: interaction, content: `You don't have a high enough role to ban ${member.user.username} (${member.id}).` });
            if (!member.bannable) return sendMessage({ client: client, interaction: interaction, content: banFailString });
            // See if target isn't already banned
            if (bansFetch) {
                if (bansFetch.has(member.id)) return sendMessage({ client: client, interaction: interaction, content: `${member.user.username} (${member.id}) is already banned.` });
            };
            banReturn = `Banned ${member.user} (${member.id}) for the following reason: ${reasonCodeBlock}`;
            await user.send({ content: dmString })
                .then(message => banReturn += `Succeeded in sending a DM to ${user.username} with the reason.`)
                .catch(e => banReturn += `Failed to send a DM to ${user.username} with the reason.`);
            if (deleteMessageSeconds > 0) banReturn += deletedMessagesString;
            try {
                await member.ban({ reason: `${reason} ${reasonInfo}`, deleteMessageSeconds: deleteMessageSeconds });
                return sendMessage({ client: client, interaction: interaction, content: banReturn, ephemeral: ephemeral });
            } catch (e) {
                // console.log(e);
                return sendMessage({ client: client, interaction: interaction, content: banFailString });
            };
        } else if (userIDArg) {
            // Try to ban by ID ("hackban") instead
            // See if target isn't already banned
            if (bansFetch) {
                if (bansFetch.has(userIDArg)) return sendMessage({ client: client, interaction: interaction, content: `<@${userIDArg}> (${userIDArg}) is already banned.` });
            };
            banReturn = `Banned <@${userIDArg}> (${userIDArg}) for the following reason: ${reasonCodeBlock}No DM was sent since this ban was by ID or the user was not in the server.`;
            if (deleteMessageSeconds > 0) banReturn += deletedMessagesString;
            try {
                await interaction.guild.members.ban(userIDArg, { reason: `${reason} ${reasonInfo}`, deleteMessageSeconds: deleteMessageSeconds });
                return sendMessage({ client: client, interaction: interaction, content: banReturn, ephemeral: ephemeral });
            } catch (e) {
                // console.log(e);
                if (e.toString().includes("Missing Permissions")) {
                    return logger(e, client, interaction);
                } else {
                    return sendMessage({ client: client, interaction: interaction, content: banFailString });
                };
            };
        } else {
            return sendMessage({ client: client, interaction: interaction, content: `You need to provide a user to ban either through the \`user\` or the \`user-id\` argument.` });
        };

    } catch (e) {
        logger(e, client, interaction);
    };
};

export const config = {
    name: "ban",
    description: "Bans target user.",
    options: [{
        name: "user",
        type: Discord.ApplicationCommandOptionType.User,
        description: "User to ban.",
    }, {
        name: "reason",
        type: Discord.ApplicationCommandOptionType.String,
        description: "Reason for ban."
    }, {
        name: "delete-messages-days",
        type: Discord.ApplicationCommandOptionType.Integer,
        description: "Amount of days to delete messages for.",
        minValue: 0,
        maxValue: 7
    }, {
        name: "user-id",
        type: Discord.ApplicationCommandOptionType.String,
        description: "Ban user by ID.",
    }]
};