module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (!message.member.hasPermission("BAN_MEMBERS")) return message.reply(globalVars.lackPerms);
        if (!message.channel.permissionsFor(message.guild.me).has("BAN_MEMBERS")) return message.channel.send(`> I lack the required permissions to ban members, ${message.author}.`);

        const args = message.content.split(' ');

        const member = message.mentions.members.first();
        let user = message.mentions.users.first();
        if (!member || !user) return message.channel.send(`> Please mention someone to ban, ${message.author}.`);

        let userTag = user.tag;

        if (!member.bannable) return message.channel.send(`> I lack the required permission to ban the specified member, ${message.author}.`);

        let reason = "Not specified.";
        if (args[2]) {
            reason = args.slice(2, args.length + 1);
            reason = reason.join(' ');
        };

        await member.ban({ days: 0, reason: `${reason} -${message.author.tag}` });
        await message.channel.send(`> Successfully kicked ${userTag} for the following reason: \`${reason}\`, ${message.author}.`);
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
