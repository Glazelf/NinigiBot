module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const isAdmin = require('../../util/isAdmin');
        if (!message.member.hasPermission("BAN_MEMBERS") && !isAdmin(message.member, client)) return message.reply(globalVars.lackPerms);

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
            if (targetRole.position >= userRole.position && message.guild.ownerID !== message.author.id) return message.channel.send(`> You don't have a high enough role to ban ${member.user.tag}, ${message.author}.`);

            try {
                await user.send(`> You've been banned from **${message.guild.name}** for the following reason: \`${reason}\``);
                banReturn = `> Successfully banned ${member.user.tag} for the following reason: \`${reason}\`, ${message.author}. (DM Succeeded)`;
            } catch (e) {
                // console.log(e);
                banReturn = `> Successfully banned ${member.user.tag} for the following reason: \`${reason}\`, ${message.author}. (DM Failed)`;
            };

            await member.ban({ days: 0, reason: `${reason} -${message.author.tag}` });
        } else {
            banReturn = `> Successfully banned ${memberID} for the following reason: \`${reason}\`, ${message.author}.`;
            try {
                await message.guild.members.ban(memberID, { days: 0, reason: `${reason} -${message.author.tag}` });
            } catch (e) {
                // console.log(e);
                return message.channel.send(`> Could not find a user by that ID, ${message.author}.`);
            }
        };

        return message.channel.send(banReturn);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "ban",
    aliases: []
};
