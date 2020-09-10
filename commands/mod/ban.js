module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (!message.member.hasPermission("BAN_MEMBERS")) return message.reply(globalVars.lackPerms);
        if (!message.channel.permissionsFor(message.guild.me).has("BAN_MEMBERS")) return message.channel.send(`> I lack the required permissions to ban members, ${message.author}.`);

        const args = message.content.split(' ');

        const member = message.mentions.members.first();
        if (!member) return message.channel.send(`> Please mention someone to ban, ${message.author}.`);

        let reason = "Not specified.";
        if (args[2]) {
            reason = args.slice(2, args.length + 1);
            reason = reason.join(' ');
        };

        await member.ban({ days: 0, reason: reason })
        return message.channel.send(`> Successfully kicked ${args[1]} for reason: \`${reason}\`, ${message.author}.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};
