exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = isAdmin(client, interaction.member);
        const { StarboardChannels } = require('../../database/dbServices/server.api');
        const { StarboardLimits } = require('../../database/dbServices/server.api');
        if (!interaction.member.permissions.has("MANAGE_CHANNELS") && !adminBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        let ephemeral = true;
        await interaction.deferReply({ ephemeral: ephemeral });

        let oldChannel = await StarboardChannels.findOne({ where: { server_id: interaction.guild.id } });
        let oldStarLimitDB = await StarboardLimits.findOne({ where: { server_id: interaction.guild.id } });
        let starlimit = null;
        if (oldStarLimitDB) {
            starlimit = oldStarLimitDB.star_limit;
        } else {
            starlimit = globalVars.starboardLimit;
        };

        let targetChannel;
        let channelArg = interaction.options.getChannel("channel");
        if (channelArg) targetChannel = channelArg;
        let disableBool = false;
        let disableArg = interaction.options.getBoolean("disable");
        if (disableArg === true) disableBool = disableArg;

        let starlimitArg = interaction.options.getInteger("starlimit");
        if (starlimitArg) {
            starlimit = starlimitArg;
            if (oldStarLimitDB) await oldStarLimitDB.destroy();
            await StarboardLimits.upsert({ server_id: interaction.guild.id, star_limit: starlimit });
        };

        if (!targetChannel && !disableBool) return sendMessage({ client: client, interaction: interaction, content: `That channel does not exist in this server.` });

        // Database
        if (oldChannel) await oldChannel.destroy();
        if (disableBool) return sendMessage({ client: client, interaction: interaction, content: `Disabled starboard functionality.` });

        await StarboardChannels.upsert({ server_id: interaction.guild.id, channel_id: targetChannel.id });

        return sendMessage({ client: client, interaction: interaction, content: `${targetChannel} is now **${interaction.guild.name}**'s starboard. ${starlimit} stars are required for a message to appear there.` });

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
        name: "starlimit",
        type: "INTEGER",
        description: "Required amount of stars on a message."
    }, {
        name: "disable",
        type: "BOOLEAN",
        description: "Disable starboard."
    }]
};