exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        const getTime = require('../../util/getTime');
        let adminBool = isAdmin(client, interaction.member);
        if (!interaction.member.permissions.has("KICK_MEMBERS") && !adminBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        // Get user, change to get from interaction args
        let user = interaction.options.getUser("user");
        let member = await interaction.guild.members.fetch(user.id);
        if (!member) return sendMessage({ client: client, interaction: interaction, content: `Please provide a user to kick.` });

        let kickFailString = `Kick failed. Either the specified user isn't in the server or I lack kicking permissions.`;

        // Check permissions
        let userRole = interaction.member.roles.highest;
        let targetRole = member.roles.highest;
        if (targetRole.position >= userRole.position && interaction.guild.ownerId !== interaction.user.id) return sendMessage({ client: client, interaction: interaction, content: `You don't have a high enough role to kick **${user.tag}** (${user.id}).` });
        if (!member.kickable) return sendMessage({ client: client, interaction: interaction, content: kickFailString });

        let reason = "Not specified.";
        let reasonArg = interaction.options.getString("reason");
        if (reasonArg) reason = reasonArg;

        let time = await getTime(client);
        let reasonInfo = `-${interaction.user.tag} (${time})`;

        // Kick
        let kickReturn = `Successfully kicked **${user.tag}** for reason: \`${reason}\`.`;

        try {
            try {
                await user.send({ content: `You've been kicked from **${interaction.guild.name}** for the following reason: \`${reason}\`` });
                kickReturn += " (DM Succeeded)";
            } catch (e) {
                // console.log(e);
                kickReturn += " (DM Failed)";
            };

            await member.kick([`${reason} ${reasonInfo}`]);
            return sendMessage({ client: client, interaction: interaction, content: kickReturn, ephemeral: false });
        } catch (e) {
            // console.log(e);
            if (e.toString().includes("Missing Permissions")) {
                return logger(e, client, interaction);
            } else {
                return sendMessage({ client: client, interaction: interaction, content: kickFailString });
            };
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "kick",
    description: "Kick a target user from the server.",
    options: [{
        name: "user",
        type: "USER",
        description: "User to kick.",
        required: true
    }, {
        name: "reason",
        type: "STRING",
        description: "Reason for kick."
    }]
};