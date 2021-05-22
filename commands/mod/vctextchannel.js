module.exports.run = async (client, message, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        if (!message.member.permissions.has("MANAGE_CHANNELS") && !isAdmin(message.member, client)) return sendMessage(client, message, globalVars.lackPerms);

        const { VCTextChannels } = require('../../database/dbObjects');
        let oldChannel = await VCTextChannels.findOne({ where: { server_id: message.guild.id } });

        let subCommand = args[0];
        if (!subCommand) {
            if (oldChannel) {
                return sendMessage(client, message, `The current VC text channel is <#${oldChannel.channel_id}>.`);
            };
            return sendMessage(client, message, `Please provide a valid channel or \`disable\`.`);
        };
        subCommand = subCommand.toLowerCase();

        let targetChannel = message.guild.channels.cache.find(channel => channel.name == subCommand);
        if (!targetChannel) targetChannel = message.guild.channels.cache.find(channel => subCommand.includes(channel.id));
        if (!targetChannel && subCommand !== "disable") return sendMessage(client, message, `That channel does not exist in this server.`);

        if (oldChannel) await oldChannel.destroy();
        if (subCommand == "disable") return sendMessage(client, message, `Disabled VC text channel functionality in **${message.guild.name}**.`);

        await VCTextChannels.upsert({ server_id: message.guild.id, channel_id: targetChannel.id });

        return sendMessage(client, message, `${targetChannel} is now **${message.guild.name}**'s VC text channel.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "vctextchannel",
    aliases: ["vtc", "voicetext", "vcchannel"],
    description: "Choose a channel to be linked to vc's.",
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