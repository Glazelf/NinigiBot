exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        const getTime = require('../../util/getTime');
        let adminBool = await isAdmin(client, message.member);
        if (!message.member.permissions.has("BAN_MEMBERS") && !adminBool) return sendMessage(client, message, globalVars.lackPerms);

        // Get user
        let user;
        let member;
        if (message.mentions && (message.mentions.members.size > 0 || message.mentions.repliedUser)) {
            user = message.mentions.users.first();
            member = message.mentions.members.first();
        } else {
            if (!args[0]) return sendMessage(client, message, `You need to provide a user to ban.`);
            try {
                user = await client.users.fetch(args[0]);
            } catch (e) {
                // console.log(e);
            };
            try {
                member = await message.guild.members.fetch(args[0]);
            } catch (e) {
                // console.log(e);
            };

        };

        let banReturn = null;
        let banFailString = `Ban failed. Either the specified user isn't in the server or I lack banning permissions.`;

        let reason = "Not specified.";
        if (args[1]) {
            reason = args.slice(1, args.length + 1);
            reason = reason.join(' ');
        };

        let dmString = `You've been banned from **${message.guild.name}** for the following reason: \`${reason}\``;

        let author = message.member.user;

        let bansFetch;
        try {
            bansFetch = await message.guild.bans.fetch();
        } catch (e) {
            // console.log(e);
            bansFetch = null;
        };

        let time = await getTime(client);

        // If user is found
        if (member) {
            // Check permissions
            let userRole = message.member.roles.highest;
            let targetRole = member.roles.highest;
            if (targetRole.position >= userRole.position && message.guild.ownerId !== message.member.id) return sendMessage(client, message, `You don't have a high enough role to ban **${member.user.tag}** (${member.id}).`);

            // See if target isn't already banned
            if (bansFetch) {
                if (bansFetch.has(member.id)) return sendMessage(client, message, `**${member.user.tag}** (${member.id}) is already banned.`);
            };

            // Ban
            banReturn = `Successfully banned **${member.user.tag}** (${member.id}) for the following reason: \`${reason}\`.`;
            try {
                await user.send({ content: dmString });
                banReturn = `${banReturn} (DM Succeeded)`;
            } catch (e) {
                // console.log(e);
                banReturn = `${banReturn} (DM Failed)`;
            };
            try {
                await member.ban({ days: 0, reason: `${reason} -${author.tag}` });
            } catch (e) {
                // console.log(e);
                return sendMessage(client, message, banFailString);
            };

            // If user isn't found, try to ban by ID
        } else {
            let memberID = args[0];

            // See if target isn't already banned
            if (bansFetch) {
                if (bansFetch.has(memberID)) return sendMessage(client, message, `<@${memberID}> (${memberID}) is already banned.`);
            };

            banReturn = `Successfully banned <@${memberID}> (${memberID}) for the following reason: \`${reason}\`.`;

            // Ban
            try {
                await message.guild.members.ban(memberID, { days: 0, reason: `${reason} -${author.tag}` });
            } catch (e) {
                // console.log(e);
                if (e.toString().includes("Missing Permissions")) {
                    return logger(e, client, message);
                } else {
                    return sendMessage(client, message, banFailString);
                };
            };
        };

        return sendMessage(client, message, banReturn);

    } catch (e) {
        // Log error
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
