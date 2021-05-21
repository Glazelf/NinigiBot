module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        if (!message.member.permissions.has("BAN_MEMBERS") && !isAdmin(message.member, client)) return sendMessage(client, message, globalVars.lackPerms);

        const args = message.content.split(' ');

        let member = message.mentions.members.first();
        let user = message.mentions.users.first();

        let banReturn = null;
        let memberID = args[1];

        let reason = "Not specified.";
        if (args[2]) {
            reason = args.slice(2, args.length + 1);
            reason = reason.join(' ');
        };

        if (member && user) {
            let userRole = message.member.roles.highest;
            let targetRole = member.roles.highest;
            if (targetRole.position >= userRole.position && message.guild.ownerID !== message.author.id) return sendMessage(client, message, `You don't have a high enough role to ban ${member.user.tag}.`);

            try {
                await user.send(`You've been banned from **${message.guild.name}** for the following reason: \`${reason}\``);
                banReturn = `Successfully banned ${member.user.tag} for the following reason: \`${reason}\`. (DM Succeeded)`;
            } catch (e) {
                // console.log(e);
                banReturn = `Successfully banned ${member.user.tag} for the following reason: \`${reason}\`. (DM Failed)`;
            };

            await member.ban({ days: 0, reason: `${reason} -${message.author.tag}` });
        } else {
            banReturn = `Successfully banned ${memberID} for the following reason: \`${reason}\`.`;
            try {
                await message.guild.members.ban(memberID, { days: 0, reason: `${reason} -${message.author.tag}` });
            } catch (e) {
                // console.log(e);
                return sendMessage(client, message, `Could not find a user by that ID.`);
            }
        };

        return sendMessage(client, message, banReturn);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "ban",
    aliases: [],
    description: "Bans target user.",
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
