exports.run = async (client, interaction, args) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(client, message.member);
        if (!message.member.permissions.has("MANAGE_CHANNELS") && !adminBool) return sendMessage({ client: client, message: message, content: globalVars.lackPerms });

        const { LogChannels } = require('../../database/dbObjects');
        let oldChannel = await LogChannels.findOne({ where: { server_id: message.guild.id } });

        // Get channel
        let subCommand = args[0];
        if (!subCommand) {
            if (oldChannel) {
                return sendMessage({ client: client, message: message, content: `The current logging channel is <#${oldChannel.channel_id}>.` });
            };
            return sendMessage({ client: client, message: message, content: `Please provide a valid channel or \`disable\`.` });
        };
        subCommand = subCommand.toLowerCase();

        // See if channel exists
        let targetChannel = message.guild.channels.cache.find(channel => channel.name == subCommand);
        if (!targetChannel) targetChannel = message.guild.channels.cache.find(channel => subCommand.includes(channel.id));
        if (!targetChannel && subCommand !== "disable") return sendMessage({ client: client, message: message, content: `That channel does not exist in this server.` });

        // Database
        if (oldChannel) await oldChannel.destroy();
        if (subCommand == "disable") return sendMessage({ client: client, message: message, content: `Disabled logging functionality in **${message.guild.name}**.` });

        await LogChannels.upsert({ server_id: message.guild.id, channel_id: targetChannel.id });

        return sendMessage({ client: client, message: message, content: `Logging has been added to ${targetChannel}.` });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "log",
    description: "Choose a channel to log to.",
    options: [{
        name: "channel",
        type: "CHANNEL",
        description: "Specify channel.",
        required: true
    }]
};