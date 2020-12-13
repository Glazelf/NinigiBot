module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (!message.member.hasPermission("KICK_MEMBERS") && message.author.id !== client.config.ownerID) return message.reply(globalVars.lackPerms);
        if (!message.guild.me.hasPermission("KICK_MEMBERS")) return message.channel.send(`> I lack the required permissions to kick members, ${message.author}.`);

        const args = message.content.split(' ');

        const member = message.mentions.members.first();
        let user = message.mentions.users.first();
        if (!member || !user) return message.channel.send(`> Please mention someone to kick, ${message.author}.`);
        if (!member.kickable) return message.channel.send(`> I lack the required permission to kick ${user.tag}, ${message.author}.`);

        let userRole = message.member.roles.highest;
        let targetRole = member.roles.highest;
        if (targetRole.position >= userRole.position || member.hasPermission("ADMINISTRATOR")) return message.channel.send(`> You don't have a high enough role to ban ${user.tag}, ${message.author}.`);

        let reason = "Not specified.";
        if (args[2]) {
            reason = args.slice(2, args.length + 1);
            reason = reason.join(' ');
        };

        await member.kick([`${reason} -${message.author.tag}`]);
        await message.channel.send(`> Successfully kicked ${user.tag} for reason: \`${reason}\`, ${message.author}.`);
        try {
            return user.send(`> You've been kicked from ${message.guild.name} for the following reason: \`${reason}\``);
        } catch (e) {
            return;
        };

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
