module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (!message.member.hasPermission("KICK_MEMBERS")) return message.reply(globalVars.lackPerms);

        const args = message.content.split(' ');

        let member = message.mentions.members.first();
        let user = message.mentions.users.first();
        if (!member || !user) return message.channel.send(`> Please mention someone to kick, ${message.author}.`);

        let userRole = message.member.roles.highest;
        let targetRole = member.roles.highest;
        if (targetRole.position >= userRole.position || member.hasPermission("ADMINISTRATOR")) return message.channel.send(`> You don't have a high enough role to ban ${user.tag}, ${message.author}.`);

        let reason = "Not specified.";
        if (args[2]) {
            reason = args.slice(2, args.length + 1);
            reason = reason.join(' ');
        };

        let kickReturn = `> Successfully kicked ${user.tag} for reason: \`${reason}\`, ${message.author}. (DM Succeeded)`;
        try {
            await user.send(`> You've been kicked from **${message.guild.name}** for the following reason: \`${reason}\``);
        } catch (e) {
            // console.log(e);
            kickReturn = `> Successfully kicked ${user.tag} for reason: \`${reason}\`, ${message.author}. (DM Failed)`;
        };
        await member.kick([`${reason} -${message.author.tag}`]);
        return message.channel.send(kickReturn);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "kick",
    aliases: []
};
