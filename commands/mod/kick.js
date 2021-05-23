module.exports.run = async (client, message, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(message.member, client);
        if (!message.member.permissions.has("KICK_MEMBERS") && !adminBool) return sendMessage(client, message, globalVars.lackPerms);

        let user;
        let member;
        if (message.mentions) {
            user = message.mentions.users.first();
            member = message.mentions.members.first();
        };
        if (!member || !user) return sendMessage(client, message, `Please mention someone to kick.`);

        let userRole = message.member.roles.highest;
        let targetRole = member.roles.highest;
        if (targetRole.position >= userRole.position && message.guild.ownerID !== message.member.id) return sendMessage(client, message, `You don't have a high enough role to kick ${user.tag}.`);

        let reason = "Not specified.";
        if (args[2]) {
            reason = args.slice(1, args.length + 1);
            reason = reason.join(' ');
        };

        let kickReturn = `Successfully kicked ${user.tag} for reason: \`${reason}\`. (DM Succeeded)`;
        try {
            await user.send(`You've been kicked from **${message.guild.name}** for the following reason: \`${reason}\``);
        } catch (e) {
            // console.log(e);
            kickReturn = `Successfully kicked ${user.tag} for reason: \`${reason}\`. (DM Failed)`;
        };
        await member.kick([`${reason} -${message.member.user.tag}`]);
        return sendMessage(client, message, kickReturn);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

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
