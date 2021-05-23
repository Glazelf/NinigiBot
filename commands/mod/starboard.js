module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(message.member, client);
        if (!message.member.permissions.has("MANAGE_CHANNELS") && !adminBool) return sendMessage(client, message, globalVars.lackPerms);

        const { StarboardChannels } = require('../../database/dbObjects');
        let oldChannel = await StarboardChannels.findOne({ where: { server_id: message.guild.id } });

        const args = message.content.split(' ');
        let subCommand = args[1];
        if (!subCommand) {
            if (oldChannel) {
                return message.channel.send(`> The current starboard channel is <#${oldChannel.channel_id}>, ${message.author}. ${globalVars.starboardLimit} stars are required for a message to appear there.`);
            };
            return message.channel.send(`> Please provide a valid channel or \`disable\`, ${message.author}.`);
        };
        subCommand = subCommand.toLowerCase();

        let targetChannel = message.guild.channels.cache.find(channel => channel.name == subCommand);
        if (!targetChannel) targetChannel = message.guild.channels.cache.find(channel => subCommand.includes(channel.id));
        if (!targetChannel && subCommand !== "disable") return message.channel.send(`> That channel does not exist in this server, ${message.author}.`);

        if (oldChannel) await oldChannel.destroy();
        if (subCommand == "disable") return message.channel.send(`> Disabled starboard functionality in **${message.guild.name}**, ${message.author}.`);

        await StarboardChannels.upsert({ server_id: message.guild.id, channel_id: targetChannel.id });

        return message.channel.send(`> ${targetChannel} is now **${message.guild.name}**'s starboard, ${message.author}. ${globalVars.starboardLimit} stars are required for a message to appear there.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "starboard",
    aliases: []
};