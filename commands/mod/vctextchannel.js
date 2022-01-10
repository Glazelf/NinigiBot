exports.run = async (client, message, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(client, message.member);
        if (!message.member.permissions.has("MANAGE_CHANNELS") && !adminBool) return sendMessage(client, message, globalVars.lackPerms);

        const { VCTextChannels } = require('../../database/dbObjects');
        let oldChannel = await VCTextChannels.findOne({ where: { server_id: message.guild.id } });

        // Get channel
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

        // Database
        if (oldChannel) await oldChannel.destroy();
        if (subCommand == "disable") return sendMessage(client, message, `Disabled VC text channel functionality in **${message.guild.name}**.`);

        await VCTextChannels.upsert({ server_id: message.guild.id, channel_id: targetChannel.id });

        return sendMessage(client, message, `${targetChannel} is now **${message.guild.name}**'s VC text channel.`);

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "vctextchannel",
    aliases: ["vtc", "voicetext", "vcchannel"],
    description: "Choose a channel to be linked to vc's.",
    options: [{
        name: "channel",
        type: "CHANNEL",
        description: "Specify channel."
    }]
};