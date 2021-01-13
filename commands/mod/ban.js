module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (!message.member.hasPermission("BAN_MEMBERS") && message.author.id !== client.config.ownerID) return message.reply(globalVars.lackPerms);
        if (!message.guild.me.hasPermission("BAN_MEMBERS")) return message.channel.send(`> I lack the required permissions to ban members, ${message.author}.`);

        const args = message.content.split(' ');

        const member = message.mentions.members.first();
        let user = message.mentions.users.first();
        if (!member || !user) return message.channel.send(`> Please mention someone to ban, ${message.author}.`);
        if (!member.bannable) return message.channel.send(`> I lack the required permissions to ban ${user.tag}, ${message.author}.`);

        let userRole = message.member.roles.highest;
        let targetRole = member.roles.highest;
        if (targetRole.position >= userRole.position || member.hasPermission("ADMINISTRATOR")) return message.channel.send(`> You don't have a high enough role to ban ${user.tag}, ${message.author}.`);

        let reason = "Not specified.";
        if (args[2]) {
            reason = args.slice(2, args.length + 1);
            reason = reason.join(' ');
        };

        let banReturn = `> Successfully banned ${user.tag} for the following reason: \`${reason}\`, ${message.author}. (DM Succeeded)`;
        try {
            await user.send(`> You've been banned from **${message.guild.name}** for the following reason: \`${reason}\``);
        } catch (e) {
            console.log(e);
            banReturn = `> Successfully banned ${user.tag} for the following reason: \`${reason}\`, ${message.author}. (DM Failed)`;
        };
        await member.ban({ days: 0, reason: `${reason} -${message.author.tag}` });
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
