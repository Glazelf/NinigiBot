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

        let user = null;
        let member = null;
        let userArg = interaction.options.getUser("user");
        if (userArg) {
            user = userArg;
            member = interaction.options.getMember("user");
        };
        let userIDArg = interaction.options.getString("user-id");
        let author = interaction;
        let reason = "Not specified.";
        let reasonArg = interaction.options.getString("reason");
        if (reasonArg) reason = reasonArg;
        let deleteMessageDays = 0;
        let deleteMessageDaysArg = interaction.options.getInteger("delete-messages-days");
        if (deleteMessageDaysArg) deleteMessageDays = deleteMessageDaysArg;
        if (deleteMessageDays < 0) deleteMessageDays = 0;
        if (deleteMessageDays > 7) deleteMessageDays = 7;

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
        let reasonInfo = `-${interaction.user.tag} (${time})`;

        // If user is found
        if (member) {
            // Check permissions
            let userRole = interaction.member.roles.highest;
            let targetRole = member.roles.highest;
            if (targetRole.position >= userRole.position && interaction.guild.ownerId !== interaction.user.id) return sendMessage({ client: client, interaction: interaction, content: `You don't have a high enough role to ban **${member.user.tag}** (${member.id}).` });
            if (!member.bannable) return sendMessage({ client: client, interaction: interaction, content: banFailString });

            // See if target isn't already banned
            if (bansFetch) {
                if (bansFetch.has(member.id)) return sendMessage({ client: client, interaction: interaction, content: `**${member.user.tag}** (${member.id}) is already banned.` });
            };

            // Ban
            banReturn = `Successfully banned **${member.user.tag}** (${member.id}) for the following reason: \`${reason}\`.`;

            try {
                try {
                    await user.send({ content: dmString });
                    banReturn += " (DM Succeeded)";
                } catch (e) {
                    // console.log(e);
                    banReturn += " (DM Failed)";
                };

                // Change input field name "days" to "deleteMessageDays" when updating to DiscordJS v14, for ID ban too
                await member.ban({ reason: `${reason} ${reasonInfo}`, days: deleteMessageDays });
                return sendMessage({ client: client, interaction: interaction, content: banReturn, ephemeral: ephemeral });
            } catch (e) {
                // console.log(e);
                return sendMessage({ client: client, interaction: interaction, content: banFailString });
            };
        } else {
            // If user isn't found, try to ban by ID
            if (!userIDArg) return sendMessage({ client: client, interaction: interaction, content: `You need to provide a user to ban.` });
            let memberID = userIDArg;

            // See if target isn't already banned
            if (bansFetch) {
                if (bansFetch.has(memberID)) return sendMessage({ client: client, interaction: interaction, content: `<@${memberID}> (${memberID}) is already banned.` });
            };

            banReturn = `Successfully banned <@${memberID}> (${memberID}) for the following reason: \`${reason}\`.`;
            try {
                await interaction.guild.members.ban(memberID, { reason: `${reason} ${reasonInfo}`, days: deleteMessageDays });
                return sendMessage({ client: client, interaction: interaction, content: banReturn, ephemeral: ephemeral });
            } catch (e) {
                // console.log(e);
                if (e.toString().includes("Missing Permissions")) {
                    return logger(e, client, interaction);
                } else {
                    return sendMessage({ client: client, interaction: interaction, content: banFailString });
                };
            };
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