const Discord = require("discord.js");
exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(client, message.member);
        if (!message.member.permissions.has("MANAGE_CHANNELS") && !adminBool) return sendMessage({ client: client, message: message, content: globalVars.lackPerms });

        const { DisabledChannels } = require('../../database/dbObjects');

        let channel = null;
        let subCommand = null;

        // Get input, default to current channel
        if (args[0]) {
            subCommand = args[0].toLowerCase();
        } else {
            subCommand = message.channel.id;
        };

        // If no input check stuff
        if (!channel) channel = message.guild.channels.cache.find(channel => channel.name == subCommand);
        if (!channel) channel = message.guild.channels.cache.find(channel => subCommand.includes(channel.id));
        if (!channel) channel = message.channel;

        let channelName = channel.name.toLowerCase();
        let channelID = await DisabledChannels.findOne({ where: { channel_id: channel.id } });

        // Database
        if (channelID) {
            await channelID.destroy();
            return sendMessage({ client: client, message: message, content: `Commands can now be used in ${channel} again.` });
        } else {
            await DisabledChannels.upsert({ channel_id: channel.id, name: channelName });
            return sendMessage({ client: client, message: message, content: `Commands can no longer be used in ${channel}.` });
        };

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "togglechannel",
    aliases: ["tc"],
    description: "Toggles commands in a channel.",
    options: [{
        name: "channel",
        type: Discord.ApplicationCommandOptionType.Channel,
        description: "Specify channel.",
        required: true
    }]
};