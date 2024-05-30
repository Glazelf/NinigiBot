const Discord = require("discord.js");
exports.run = async (client, interaction, logger, ephemeral) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = isAdmin(client, interaction.member);

        ephemeral = false;
        let slowmodeSupportedChannelTypes = [
            Discord.ChannelType.GuildText,
            Discord.ChannelType.GuildPublicThread,
            Discord.ChannelType.GuildPrivateThread,
            Discord.ChannelType.GuildStageVoice,
            Discord.ChannelType.GuildVoice
        ];
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageChannels) && !adminBool) return sendMessage({ client: client, interaction: interaction, content: client.globalVars.lackPerms });
        if (!slowmodeSupportedChannelTypes.includes(interaction.channel.type)) return sendMessage({ client: client, interaction: interaction, content: `This channel type doesn't support slowmode.` });

        let time = interaction.options.getInteger("time");
        await interaction.channel.setRateLimitPerUser(time);
        return sendMessage({ client: client, interaction: interaction, content: `Slowmode set to ${time} seconds.`, ephemeral: ephemeral });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "slowmode",
    description: "Set slowmode in the current channel.",
    options: [{
        name: "time",
        type: Discord.ApplicationCommandOptionType.Integer,
        description: "Time in seconds. 0 to disable.",
        required: true,
        minValue: 0,
        maxValue: 21600
    }]
};