exports.run = async (client, interaction, args) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(client, message.member);
        if (!message.member.permissions.has("MANAGE_CHANNELS") && !adminBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        const { LogChannels } = require('../../database/dbObjects');
        let oldChannel = await LogChannels.findOne({ where: { server_id: message.guild.id } });

        let newLogChannel;
        let channelArg = args.find(element => element.name == "channel");
        if (channelArg) newLogChannel = channelArg.value;

        let disableBool = false;
        let disableArg = args.find(element => element.name == "disable");
        if (disableArg) disableBool = disableArg.value;
        if (!channelArg && !disableBool) {
            if (oldChannel) {
                return sendMessage({ client: client, interaction: interaction, content: `The current logging channel is <#${oldChannel.channel_id}>.` });
            };
            return sendMessage({ client: client, interaction: interaction, content: `Please provide a valid channel.` });
        };

        let targetChannel;
        if (newLogChannel) targetChannel = message.guild.channels.cache.find(channel => channel.id == newLogChannel.id);

        if (oldChannel) await oldChannel.destroy();
        if (disableBool) return sendMessage({ client: client, interaction: interaction, content: `Disabled logging functionality in **${message.guild.name}**.` });

        await LogChannels.upsert({ server_id: message.guild.id, channel_id: targetChannel.id });

        return sendMessage({ client: client, interaction: interaction, content: `Logging has been added to ${targetChannel}.` });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "log",
    description: "Choose a channel to log to.",
    options: [{
        name: "channel",
        type: "CHANNEL",
        description: "Specify channel."
    }, {
        name: "disable",
        type: "BOOLEAN",
        description: "Disable logging."
    }]
};