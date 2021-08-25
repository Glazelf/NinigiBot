exports.run = async (client, message, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(message.member, client);
        if (!message.member.permissions.has("MANAGE_CHANNELS") && !adminBool) return sendMessage(client, message, globalVars.lackPerms);

        const { DisabledChannels } = require('../../database/dbObjects');

        let channel = null;
        let subCommand = null;

        if (args[0]) {
            subCommand = args[0].toLowerCase();
        } else {
            subCommand = message.channel.id;
        };

        if (!channel) channel = message.guild.channels.cache.find(channel => channel.name == subCommand);
        if (!channel) channel = message.guild.channels.cache.find(channel => subCommand.includes(channel.id));
        if (!channel) channel = message.channel;

        let channelName = channel.name.toLowerCase();
        let channelID = await DisabledChannels.findOne({ where: { channel_id: channel.id } });

        if (channelID) {
            await channelID.destroy();
            return sendMessage(client, message, `Commands can now be used in ${channel} again.`);
        } else {
            await DisabledChannels.upsert({ channel_id: channel.id, name: channelName });
            return sendMessage(client, message, `Commands can no longer be used in ${channel}.`);
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "togglechannel",
    aliases: ["tc"],
    description: "Toggles commands in a channel.",
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