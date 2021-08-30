exports.run = async (client, message, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const getLanguageString = require('../../util/getLanguageString');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(message.member, client);
        if (!message.member.permissions.has("BAN_MEMBERS") && !adminBool) return sendMessage(client, message, globalVars.lackPerms);

        let user;
        let member;
        if (message.mentions && (message.mentions.members.size > 0 || message.mentions.repliedUser)) {
            user = message.mentions.users.first();
            member = message.mentions.members.first();
        } else {
            if (!args[0]) return sendMessage(client, message, `You need to provide a user to ban.`);
            user = client.users.cache.get(args[0]);
            member = message.guild.members.cache.get(args[0]);
        };

        let banReturn = null;

        let reason = "Not specified.";
        if (args[1]) {
            reason = args.slice(1, args.length + 1);
            reason = reason.join(' ');
        };

        let author;
        if (message.type == 'DEFAULT') {
            author = message.author;
        } else {
            author = message.member.user;
        };

        if (member) {
            let userRole = message.member.roles.highest;
            let targetRole = member.roles.highest;
            if (targetRole.position >= userRole.position && message.guild.ownerId !== message.member.id) return sendMessage(client, message, `You don't have a high enough role to ban **${member.user.tag}** (${member.id}).`);

            try {
                await user.send({ content: `You've been banned from **${message.guild.name}** for the following reason: \`${reason}\`` });
                banReturn = `Successfully banned **${member.user.tag}** (${member.id}) for the following reason: \`${reason}\`. (DM Succeeded)`;
            } catch (e) {
                // console.log(e);
                banReturn = `Successfully banned **${member.user.tag}** (${member.id}) for the following reason: \`${reason}\`. (DM Failed)`;
            };
            await member.ban({ days: 0, reason: `${reason} -${author.tag}` });

        } else {
            let memberID = args[0];

            banReturn = `Successfully banned <@${memberID}> (${memberID}) for the following reason: \`${reason}\`.`;
            try {
                await message.guild.members.ban(memberID, { days: 0, reason: `${reason} -${author.tag}` });
            } catch (e) {
                console.log(e);
                if (e.toString().includes("Missing Permissions")) {
                    return logger(e, client, message);
                } else {
                    return sendMessage(client, message, `Could not find a user by that ID.`);
                };
            };
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
