exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(client, message.member);

        if (!message.member.permissions.has("MANAGE_CHANNELS") && !adminBool) return sendMessage({ client: client, message: message, content: globalVars.lackPerms });
        if (message.channel.type != "GUILD_TEXT") return sendMessage({ client: client, message: message, content: `This channel type doesn't support slowmode.` });

        let slowmodeMaxSeconds = 21600;

        // Toggle slowmode
        if (!args[0] || isNaN(args[0]) || args[0] < 0) return sendMessage({ client: client, message: message, content: `You need to provide a valid number (seconds) to change the slowmode to.` });
        if (args[0] > slowmodeMaxSeconds) args[0] = slowmodeMaxSeconds;

        await message.channel.setRateLimitPerUser(args[0]);
        return sendMessage({ client: client, message: message, content: `Slowmode changed to ${args[0]} seconds.` });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "slowmode",
    description: "Set slowmode in the current channel.",
    options: [{
        name: "seconds",
        type: "INTEGER",
        description: "The amount of slowmode in seconds.",
        required: true
    }]
};