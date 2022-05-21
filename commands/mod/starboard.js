exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(client, interaction.member);
        if (!interaction.member.permissions.has("MANAGE_CHANNELS") && !adminBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        const { StarboardChannels } = require('../../database/dbObjects');
        let oldChannel = await StarboardChannels.findOne({ where: { server_id: interaction.guild.id } });

        // Check input
        let subCommand = args[0];
        if (!subCommand) {
            if (oldChannel) {
                return sendMessage({ client: client, interaction: interaction, content: `The current starboard channel is <#${oldChannel.channel_id}>. ${globalVars.starboardLimit} stars are required for a message to appear there.` });
            };
            return sendMessage({ client: client, interaction: interaction, content: `Please provide a valid channel or \`disable\`.` });
        };
        subCommand = subCommand.toLowerCase();

        // Get channel
        let targetChannel = interaction.guild.channels.cache.find(channel => channel.name == subCommand);
        if (!targetChannel) targetChannel = interaction.guild.channels.cache.find(channel => subCommand.includes(channel.id));
        if (!targetChannel && subCommand !== "disable") return sendMessage({ client: client, interaction: interaction, content: `That channel does not exist in this server.` });

        // Database
        if (oldChannel) await oldChannel.destroy();
        if (subCommand == "disable") return sendMessage({ client: client, interaction: interaction, content: `Disabled starboard functionality in **${interaction.guild.name}**.` });

        await StarboardChannels.upsert({ server_id: interaction.guild.id, channel_id: targetChannel.id });

        return sendMessage({ client: client, interaction: interaction, content: `${targetChannel} is now **${interaction.guild.name}**'s starboard. ${globalVars.starboardLimit} stars are required for a message to appear there.` });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "starboard",
    description: "Choose a starboard channel.",
    options: [{
        name: "channel",
        type: "CHANNEL",
        description: "Specify channel."
    }, {
        name: "disable",
        type: "BOOLEAN",
        description: "Disable starboard."
    }]
};