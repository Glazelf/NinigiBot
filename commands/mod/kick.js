module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (!message.member.hasPermission("KICK_MEMBERS") && message.author.id !== client.config.ownerID) return message.reply(globalVars.lackPerms);
        if (!message.channel.permissionsFor(message.guild.me).has("KICK_MEMBERS")) return message.channel.send(`> I lack the required permissions to kick members, ${message.author}.`);

        const args = message.content.split(' ');

        const member = message.mentions.members.first();
        let user = message.mentions.users.first();
        if (!member) return message.channel.send(`> Please mention someone to kick, ${message.author}.`);

        let userTag = user.tag;

        if (!member.kickable) return message.channel.send(`> I lack the required permission to kick the specified member, ${message.author}.`);

        let reason = "Not specified.";
        if (args[2]) {
            reason = args.slice(2, args.length + 1);
            reason = reason.join(' ');
        };

        await member.kick([`${reason} -${message.author.tag}`]);
        await message.channel.send(`> Successfully kicked ${userTag} for reason: \`${reason}\`, ${message.author}.`);
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
