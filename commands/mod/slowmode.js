module.exports.run = async (client, message, args) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (!message.member.hasPermission("MANAGE_CHANNELS") && message.author.id !== client.config.ownerID) return message.reply(globalVars.lackPerms);
        if (!message.channel.permissionsFor(message.guild.me).has("MANAGE_CHANNELS")) return message.channel.send(`> I don't have permission to manage channels, ${message.author}.`);

        let arg = args[0];
        if (!arg) arg = 0;
        if (arg.toLowerCase() == "max") arg = 21600;
        if (isNaN(arg) || arg < 0) return message.channel.send(`> You need to provide a valid number (seconds) to change the slowmode to, ${message.author}.`);
        if (arg > 21600) arg = 21600;

        await message.channel.setRateLimitPerUser(arg);
        return message.channel.send(`> Slowmode changed to ${arg} seconds, ${message.author}.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "slowmode",
    aliases: ["slow"]
};