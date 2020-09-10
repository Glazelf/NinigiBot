module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (!message.member.hasPermission("MANAGE_CHANNELS")) return message.reply(globalVars.lackPerms);

        const { DisabledChannels } = require('../../database/dbObjects');

        const input = message.content.slice(1).trim();
        const [, , arguments] = input.match(/(\w+)\s*([\s\S]*)/);

        if (arguments.length < 1) return message.channel.send(`> Please provide a channel, ${message.author}.`);

        let channelID = await DisabledChannels.findOne({ where: { name: arguments } });
        const channel = message.member.guild.channels.cache.find(channel => channel.id === arguments);
        if(!channel) channel = message.member.guild.channels.cache.find(channel => channel.name.toLowerCase() === arguments.toLowerCase());

        if (!channel && !channelID) return message.channel.send(`> That channel does not exist in this server, ${message.author}.`);
        if (!channelID) channelID = await DisabledChannels.findOne({ where: { channel_id: channel.id } });

        if (channelID) {
            let channelTag = channel;
            await channelID.destroy();
            return message.channel.send(`> Commands can now be used in ${channelTag} again, ${message.author}.`);
        } else {
            await DisabledChannels.upsert({ channel_id: channel.id, name: arguments.toLowerCase() });
            return message.channel.send(`> Commands can no longer be used in ${channel}, ${message.author}.`);
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};
