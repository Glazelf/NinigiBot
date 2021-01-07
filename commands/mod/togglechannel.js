module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (!message.member.hasPermission("MANAGE_CHANNELS") && message.author.id !== client.config.ownerID) return message.reply(globalVars.lackPerms);

        const { DisabledChannels } = require('../../database/dbObjects');

        let channel = null;
        let subCommand = null;
        const args = message.content.split(' ');

        if (args[1]) {
            subCommand = args[1].toLowerCase();
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
            return message.channel.send(`> Commands can now be used in ${channel} again, ${message.author}.`);
        } else {
            await DisabledChannels.upsert({ channel_id: channel.id, name: channelName });
            return message.channel.send(`> Commands can no longer be used in ${channel}, ${message.author}.`);
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "togglechannel",
    aliases: ["tc"]
};