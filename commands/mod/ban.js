exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        const getTime = require('../../util/getTime');
        let adminBool = isAdmin(client, interaction.member);
        if (!interaction.member.permissions.has("BAN_MEMBERS") && !adminBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        let ephemeral = false;
        await interaction.deferReply({ ephemeral: ephemeral });

        let user = interaction.options.getUser("user");
        let member = interaction.options.getMember("user");
        let userIDArg = interaction.options.getString("user-id");
        let reason = interaction.options.getString("reason");
        if (!reason) reason = `Not specified.`;
        let deleteMessageDays = 0;
        let deleteMessageDaysArg = interaction.options.getInteger("delete-messages-days");
        if (deleteMessageDaysArg) deleteMessageDays = deleteMessageDaysArg;
        if (deleteMessageDays < 0) deleteMessageDays = 0;
        if (deleteMessageDays > 7) deleteMessageDays = 7;
        let deletedMessagesString = `\nDeleted messages by banned user from the last ${deleteMessageDays} days.`;

        let banReturn = null;
        let banFailString = `Ban failed. Either the specified user isn't in the server or I lack banning permissions.`;

        let dmString = `You've been banned from **${interaction.guild.name}** for the following reason: \`${reason}\``;

        let bansFetch;
        try {
            bansFetch = await interaction.guild.bans.fetch();
        } catch (e) {
            // console.log(e);
            bansFetch = null;
        };
        let time = await getTime(client);
        let reasonInfo = `-${interaction.user.username} (${time})`;
        // If user is found
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
            banReturn = `Banned ${member.user} (${member.id}) for the following reason: \`${reason}\`.`;
            await user.send({ content: dmString })
                .then(message => banReturn += `\nSucceeded in sending a DM with the ban reason to ${member.user.username}.`)
                .catch(e => banReturn += `\nFailed to send a DM with the ban reason to ${member.user.username}.`);
            if (deleteMessageDays > 0) banReturn += deletedMessagesString;
            try {
                // Change input field name "days" to "deleteMessageDays" when updating to DiscordJS v14, for ID ban too? Maybe? deleteMessageSeconds got added in the meantime
                await member.ban({ reason: `${reason} ${reasonInfo}`, deleteMessageSeconds: deleteMessageDays * 86400 });
                return sendMessage({ client: client, interaction: interaction, content: banReturn, ephemeral: ephemeral });
            } catch (e) {
                // console.log(e);
                return sendMessage({ client: client, interaction: interaction, content: banFailString });
            };
        } else if (userIDArg) {
            // Try to ban by ID ("hackban") instead
            let memberID = userIDArg;
            // See if target isn't already banned
            if (bansFetch) {
                if (bansFetch.has(memberID)) return sendMessage({ client: client, interaction: interaction, content: `<@${memberID}> (${memberID}) is already banned.` });
            };
            banReturn = `Banned <@${memberID}> (${memberID}) for the following reason: \`${reason}\`.\nNo DM was sent since this ban was by ID.`;
            if (deleteMessageDays > 0) banReturn += deletedMessagesString;
            try {
                await interaction.guild.members.ban(memberID, { reason: `${reason} ${reasonInfo}`, deleteMessageSeconds: deleteMessageDays * 86400 });
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
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "ban",
    description: "Bans target user.",
    options: [{
        name: "user",
        type: "USER",
        description: "User to ban.",
    }, {
        name: "reason",
        type: "STRING",
        description: "Reason for ban."
    }, {
        name: "delete-messages-days",
        type: "INTEGER",
        description: "Amount of days to delete messages for. (0-7)"
    }, {
        name: "user-id",
        type: "STRING",
        description: "Ban user by ID.",
    }]
};