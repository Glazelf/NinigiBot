exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        const getTime = require('../../util/getTime');
        let adminBool = await isAdmin(client, message.member);
        if (!message.member.permissions.has("KICK_MEMBERS") && !adminBool) return sendMessage(client, message, globalVars.lackPerms);

        // Get user
        let user;
        let member;
        if (message.mentions && (message.mentions.members.size > 0 || message.mentions.repliedUser)) {
            user = message.mentions.users.first();
            member = message.mentions.members.first();
        };
        if (!member || !user) return sendMessage(client, message, `Please mention someone to kick.`);

        let author = message.member.user;

        // Check permissions
        let userRole = message.member.roles.highest;
        let targetRole = member.roles.highest;
        if (targetRole.position >= userRole.position && message.guild.ownerId !== message.member.id) return sendMessage(client, message, `You don't have a high enough role to kick **${user.tag}** (${user.id}).`);

        let banFailString = `Kick failed. Either the specified user isn't in the server or I lack kicking permissions.`;

        let reason = "Not specified.";
        if (args[1]) {
            reason = args.slice(1, args.length + 1);
            reason = reason.join(' ');
        };

        let time = await getTime(client);

        // Kick
        let kickReturn = `Successfully kicked **${user.tag}** for reason: \`${reason}\`. (DM Succeeded)`;
        try {
            await user.send({ content: `You've been kicked from **${message.guild.name}** for the following reason: \`${reason}\`` });
        } catch (e) {
            // console.log(e);
            kickReturn = `Successfully kicked **${user.tag}** for reason: \`${reason}\`. (DM Failed)`;
        };
        try {
            await member.kick([`${reason} -${author.tag} (${time})`]);
        } catch (e) {
            // console.log(e);
            if (e.toString().includes("Missing Permissions")) {
                return logger(e, client, message);
            } else {
                return sendMessage(client, message, banFailString);
            };
        };
        return sendMessage(client, message, kickReturn);

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "kick",
    aliases: [],
    description: "Kick a target user from the server.",
    options: [{
        name: "user-mention",
        type: "MENTIONABLE",
        description: "Specify user by mention."
    }, {
        name: "user-id",
        type: "STRING",
        description: "Specify user by ID."
    }]
};
