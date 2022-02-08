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

        const { StarboardChannels } = require('../../database/dbObjects');
        let oldChannel = await StarboardChannels.findOne({ where: { server_id: message.guild.id } });

        // Check input
        let subCommand = args[0];
        if (!subCommand) {
            if (oldChannel) {
                return sendMessage({ client: client, message: message, content: `The current starboard channel is <#${oldChannel.channel_id}>. ${globalVars.starboardLimit} stars are required for a message to appear there.` });
            };
            return sendMessage({ client: client, message: message, content: `Please provide a valid channel or \`disable\`.` });
        };
        subCommand = subCommand.toLowerCase();

        // Get channel
        let targetChannel = message.guild.channels.cache.find(channel => channel.name == subCommand);
        if (!targetChannel) targetChannel = message.guild.channels.cache.find(channel => subCommand.includes(channel.id));
        if (!targetChannel && subCommand !== "disable") return sendMessage({ client: client, message: message, content: `That channel does not exist in this server.` });

        // Database
        if (oldChannel) await oldChannel.destroy();
        if (subCommand == "disable") return sendMessage({ client: client, message: message, content: `Disabled starboard functionality in **${message.guild.name}**.` });

        await StarboardChannels.upsert({ server_id: message.guild.id, channel_id: targetChannel.id });

        return sendMessage({ client: client, message: message, content: `${targetChannel} is now **${message.guild.name}**'s starboard. ${globalVars.starboardLimit} stars are required for a message to appear there.` });

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "starboard",
    aliases: [],
    description: "Choose a starboard channel.",
    options: [{
        name: "channel",
        type: Discord.ApplicationCommandOptionType.Channel,
        description: "Specify channel.",
        required: true
    }]
};