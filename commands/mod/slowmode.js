module.exports.run = async (client, message, args = null) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const isAdmin = require('../../util/isAdmin');
        if (!message.member.permissions.has("MANAGE_CHANNELS") && !isAdmin(message.member, client)) return message.reply(globalVars.lackPerms);

        let arg = args[0];
        if (!arg) arg = 0;
        if (isNaN(arg) || arg < 0) return message.reply(`You need to provide a valid number (seconds) to change the slowmode to.`);
        if (arg > 21600) arg = 21600;

        await message.channel.setRateLimitPerUser(arg);
        return message.reply(`Slowmode changed to ${arg} seconds.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "slowmode",
    aliases: ["slow"],
    description: "Set slowmode in the current channel.",
    options: [{
        name: "seconds",
        type: "INTEGER",
        description: "The amount of slowmode in seconds."
    }]
};