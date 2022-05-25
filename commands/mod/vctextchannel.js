exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = isAdmin(client, interaction.member);
        if (!message.member.permissions.has("MANAGE_CHANNELS") && !adminBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        let ephemeral = true;
        await interaction.deferReply({ ephemeral: ephemeral });

        const { VCTextChannels } = require('../../database/dbObjects');
        let oldChannel = await VCTextChannels.findOne({ where: { server_id: interaction.guild.id } });

        let disable = false;
        let disableArg = interaction.options.getBoolean("disable");
        if (disableArg === true) disable = disableArg;
        let targetChannel = interaction.options.getChannel("channel");
        if (!targetChannel && subCommand !== "disable") return sendMessage({ client: client, interaction: interaction, content: `That channel does not exist in this server.` });

        if (oldChannel) await oldChannel.destroy();
        if (disable) return sendMessage({ client: client, interaction: interaction, content: `Disabled VC text channel functionality in **${interaction.guild.name}**.` });

        await VCTextChannels.upsert({ server_id: interaction.guild.id, channel_id: targetChannel.id });

        return sendMessage({ client: client, interaction: interaction, content: `${targetChannel} is now **${interaction.guild.name}**'s VC text channel.` });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "vctextchannel",
    description: "Choose a channel to be linked to vc's.",
    options: [{
        name: "channel",
        type: "CHANNEL",
        description: "Specify channel."
    }, {
        name: "disable",
        type: "BOOLEAN",
        description: "Disable vc text channel."
    }]
};