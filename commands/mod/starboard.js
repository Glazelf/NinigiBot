exports.run = async (client, message, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const getLanguageString = require('../../util/getLanguageString');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(message.member, client);
        if (!message.member.permissions.has("MANAGE_CHANNELS") && !adminBool) return sendMessage(client, message, globalVars.lackPerms);

        const { StarboardChannels } = require('../../database/dbObjects');
        let oldChannel = await StarboardChannels.findOne({ where: { server_id: message.guild.id } });

        let subCommand = args[0];
        if (!subCommand) {
            if (oldChannel) {
                return sendMessage(client, message, `The current starboard channel is <#${oldChannel.channel_id}>. ${globalVars.starboardLimit} stars are required for a message to appear there.`);
            };
            return sendMessage(client, message, `Please provide a valid channel or \`disable\`.`);
        };
        subCommand = subCommand.toLowerCase();

        let targetChannel = message.guild.channels.cache.find(channel => channel.name == subCommand);
        if (!targetChannel) targetChannel = message.guild.channels.cache.find(channel => subCommand.includes(channel.id));
        if (!targetChannel && subCommand !== "disable") return sendMessage(client, message, `That channel does not exist in this server.`);

        if (oldChannel) await oldChannel.destroy();
        if (subCommand == "disable") return sendMessage(client, message, `Disabled starboard functionality in **${message.guild.name}**.`);

        await StarboardChannels.upsert({ server_id: message.guild.id, channel_id: targetChannel.id });

        return sendMessage(client, message, `${targetChannel} is now **${message.guild.name}**'s starboard. ${globalVars.starboardLimit} stars are required for a message to appear there.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "starboard",
    aliases: [],
    description: "Choose a starboard channel.",
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