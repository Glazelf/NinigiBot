exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        const getTime = require('../../util/getTime');
        let adminBool = await isAdmin(client, message.member);
        if (!message.member.permissions.has("KICK_MEMBERS") && !adminBool) return sendMessage({ client: client, message: message, content: globalVars.lackPerms });

        // Get user
        let user;
        let member;
        if (message.mentions && (message.mentions.members.size > 0 || message.mentions.repliedUser)) {
            user = message.mentions.users.first();
            member = message.mentions.members.first();
        };
        if (!member || !user) return sendMessage({ client: client, message: message, content: `Please mention someone to kick.` });

        let kickFailString = `Kick failed. Either the specified user isn't in the server or I lack kicking permissions.`;

        // Check permissions
        let userRole = message.member.roles.highest;
        let targetRole = member.roles.highest;
        if (targetRole.position >= userRole.position && message.guild.ownerId !== message.member.id) return sendMessage({ client: client, message: message, content: `You don't have a high enough role to kick **${user.tag}** (${user.id}).` });
        if (!member.kickable) return sendMessage({ client: client, message: message, content: kickFailString });

        let reason = "Not specified.";
        if (args[1]) {
            reason = args.slice(1, args.length + 1);
            reason = reason.join(' ');
        };

        let time = await getTime(client);
        let reasonInfo = `-${message.member.user.tag} (${time})`;

        // Kick
        let kickReturn = `Successfully kicked **${user.tag}** for reason: \`${reason}\`.`;

        try {
            try {
                await user.send({ content: `You've been kicked from **${message.guild.name}** for the following reason: \`${reason}\`` });
                kickReturn += " (DM Succeeded)";
            } catch (e) {
                // console.log(e);
                kickReturn += " (DM Failed)";
            };

            await member.kick([`${reason} ${reasonInfo}`]);
            return sendMessage({ client: client, message: message, content: kickReturn, ephemeral: false });
        } catch (e) {
            // console.log(e);
            if (e.toString().includes("Missing Permissions")) {
                return logger(e, client, message);
            } else {
                return sendMessage({ client: client, message: message, content: kickFailString });
            };
        };

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "kick",
    aliases: [],
    description: "Kick a target user from the server."
};
