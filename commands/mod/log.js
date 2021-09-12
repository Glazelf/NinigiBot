exports.run = async (client, message, args) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(message.member, client);
        if (!message.member.permissions.has("MANAGE_CHANNELS") && !adminBool) return sendMessage(client, message, globalVars.lackPerms);

        const { LogChannels } = require('../../database/dbObjects');
        let oldChannel = await LogChannels.findOne({ where: { server_id: message.guild.id } });

        // Get channel
        let subCommand = args[0];
        if (!subCommand) {
            if (oldChannel) {
                return sendMessage(client, message, `The current logging channel is <#${oldChannel.channel_id}>.`);
            };
            return sendMessage(client, message, `Please provide a valid channel or \`disable\`.`);
        };
        subCommand = subCommand.toLowerCase();

        // See if channel exists
        let targetChannel = message.guild.channels.cache.find(channel => channel.name == subCommand);
        if (!targetChannel) targetChannel = message.guild.channels.cache.find(channel => subCommand.includes(channel.id));
        if (!targetChannel && subCommand !== "disable") return sendMessage(client, message, `That channel does not exist in this server.`);

        // Database
        if (oldChannel) await oldChannel.destroy();
        if (subCommand == "disable") return sendMessage(client, message, `Disabled logging functionality in **${message.guild.name}**.`);

        await LogChannels.upsert({ server_id: message.guild.id, channel_id: targetChannel.id });

        return sendMessage(client, message, `Logging has been added to ${targetChannel}.`);

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "log",
    aliases: [],
    description: "Choose a channel to log to.",
    options: [{
        name: "channel-tag",
        type: "CHANNEL",
        description: "Specify channel by mention."
    }, {
        name: "channel-id",
        type: "STRING",
        description: "Specify channel by name or ID."
    }]
};