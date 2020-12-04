module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (!message.member.hasPermission("BAN_MEMBERS") && message.author.id !== client.config.ownerID) return message.reply(globalVars.lackPerms);
        if (!message.channel.permissionsFor(message.guild.me).has("BAN_MEMBERS")) return message.channel.send(`> I lack the required permissions to ban members, ${message.author}.`);

        const args = message.content.split(' ');

        const member = message.mentions.members.first();
        let user = message.mentions.users.first();
        if (!member || !user) return message.channel.send(`> Please mention someone to ban, ${message.author}.`);

        let userRole = message.author.member.roles.first();
        let targetRole = member.roles.first();
        if (targetRole.position >= userRole.position) return message.channel.send(`> You don't have a high enough role to ban ${user.tag}, ${message.author}.`);

        if (!member.bannable) return message.channel.send(`> I lack the required permission to ban ${user.tag}, ${message.author}.`);

        let reason = "Not specified.";
        if (args[2]) {
            reason = args.slice(2, args.length + 1);
            reason = reason.join(' ');
        };

        await member.ban({ days: 0, reason: `${reason} -${message.author.tag}` });
        await message.channel.send(`> Successfully banned ${user.tag} for the following reason: \`${reason}\`, ${message.author}.`);
        try {
            return user.send(`> You've been banned from ${message.guild.name} for the following reason: \`${reason}\``);
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
    name: "ban",
    aliases: []
};
