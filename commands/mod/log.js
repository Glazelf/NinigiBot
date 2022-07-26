exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = isAdmin(client, interaction.member);
        if (!interaction.member.permissions.has("MANAGE_CHANNELS") && !adminBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        let ephemeral = true;
        await interaction.deferReply({ ephemeral: ephemeral });

        const { LogChannels } = require('../../database/dbServices/server.api');
        let oldChannel = await LogChannels.findOne({ where: { server_id: interaction.guild.id } });

        let newLogChannel;
        let channelArg = interaction.options.getChannel("channel");
        if (channelArg) newLogChannel = channelArg;

        let disableBool = false;
        let disableArg = interaction.options.getBoolean("disable");
        if (disableArg === true) disableBool = disableArg;
        if (!channelArg && !disableBool) {
            if (oldChannel) {
                return sendMessage({ client: client, interaction: interaction, content: `The current logging channel is <#${oldChannel.channel_id}>.` });
            };
            return sendMessage({ client: client, interaction: interaction, content: `Please provide a valid channel.` });
        };

        if (oldChannel) await oldChannel.destroy();
        if (disableBool) return sendMessage({ client: client, interaction: interaction, content: `Disabled logging functionality in **${interaction.guild.name}**.` });

        await LogChannels.upsert({ server_id: interaction.guild.id, channel_id: newLogChannel.id });

        return sendMessage({ client: client, interaction: interaction, content: `Logging has been added to ${newLogChannel}.` });

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