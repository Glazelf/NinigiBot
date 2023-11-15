exports.run = async (client, interaction, logger, globalVars) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const textChannelTypes = require('../../objects/discord/textChannelTypes.json');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = isAdmin(client, interaction.member);
        const { StarboardChannels } = require('../../database/dbServices/server.api');
        const { StarboardLimits } = require('../../database/dbServices/server.api');
        if (!interaction.member.permissions.has("MANAGE_CHANNELS") && !adminBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        let ephemeral = true;
        await interaction.deferReply({ ephemeral: ephemeral });
        let disableBool = false;
        let disableArg = interaction.options.getBoolean("disable");
        if (disableArg === true) disableBool = disableArg;
        switch (interaction.options.getSubcommand()) {
            case "starboard":
                let oldStarboardChannel = await StarboardChannels.findOne({ where: { server_id: interaction.guild.id } });
                let oldStarLimitDB = await StarboardLimits.findOne({ where: { server_id: interaction.guild.id } });
                let starlimit = null;
                if (oldStarLimitDB) {
                    starlimit = oldStarLimitDB.star_limit;
                } else {
                    starlimit = globalVars.starboardLimit;
                };
                let targetChannel;
                let channelArg = interaction.options.getChannel("channel");
                if (!Object.keys(textChannelTypes).includes(newLogChannel.type)) return sendMessage({ client: client, interaction: interaction, content: `No text can be sent to ${newLogChannel}'s type (${newLogChannel.type}) of channel. Please select a text channel.` })
                if (channelArg) targetChannel = channelArg;
                let starlimitArg = interaction.options.getInteger("starlimit");
                if (starlimitArg) {
                    starlimit = starlimitArg;
                    if (oldStarLimitDB) await oldStarLimitDB.destroy();
                    await StarboardLimits.upsert({ server_id: interaction.guild.id, star_limit: starlimit });
                };
                if (!targetChannel && !disableBool) return sendMessage({ client: client, interaction: interaction, content: `That channel does not exist in this server.` });
                // Database
                if (oldStarboardChannel) await oldStarboardChannel.destroy();
                if (disableBool) return sendMessage({ client: client, interaction: interaction, content: `Disabled starboard functionality.` });
                await StarboardChannels.upsert({ server_id: interaction.guild.id, channel_id: targetChannel.id });
                return sendMessage({ client: client, interaction: interaction, content: `${targetChannel} is now **${interaction.guild.name}**'s starboard. ${starlimit} stars are required for a message to appear there.` });
                break;
            case "log":
                const { LogChannels } = require('../../database/dbServices/server.api');
                let oldLogChannel = await LogChannels.findOne({ where: { server_id: interaction.guild.id } });
                let newLogChannel = interaction.options.getChannel("channel");
                if (!Object.keys(textChannelTypes).includes(newLogChannel.type)) return sendMessage({ client: client, interaction: interaction, content: `No text can be sent to ${newLogChannel}'s type (${newLogChannel.type}) of channel. Please select a text channel.` })
                if (oldLogChannel) await oldLogChannel.destroy();
                if (disableBool) return sendMessage({ client: client, interaction: interaction, content: `Disabled logging functionality in **${interaction.guild.name}**.` });
                await LogChannels.upsert({ server_id: interaction.guild.id, channel_id: newLogChannel.id });
                return sendMessage({ client: client, interaction: interaction, content: `Logging has been added to ${newLogChannel}.` });
                break;
            case "togglemod":
                const { ModEnabledServers } = require('../../database/dbServices/server.api');
                let automodServerID = await ModEnabledServers.findOne({ where: { server_id: interaction.guild.id } });
                // Database
                if (automodServerID) {
                    await automodServerID.destroy();
                    return sendMessage({ client: client, interaction: interaction, content: `**${interaction.guild.name}** will no longer be automatically moderated.` });
                } else {
                    await ModEnabledServers.upsert({ server_id: interaction.guild.id });
                    return sendMessage({ client: client, interaction: interaction, content: `**${interaction.guild.name}** will now be automatically moderated.` });
                };
                break;
            case "togglepersonalroles":
                const { PersonalRoleServers } = require('../../database/dbServices/server.api');
                let personalRolesServerID = await PersonalRoleServers.findOne({ where: { server_id: interaction.guild.id } });
                // Database
                if (personalRolesServerID) {
                    await personalRolesServerID.destroy();
                    return sendMessage({ client: client, interaction: interaction, content: `Personal Roles can no longer be managed by users in **${interaction.guild.name}**.` });
                } else {
                    await PersonalRoleServers.upsert({ server_id: interaction.guild.id });
                    return sendMessage({ client: client, interaction: interaction, content: `Personal Roles can now be managed by users in **${interaction.guild.name}**.` });
                };
                break;
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "serversettings",
    description: "Change server settings.",
    options: [{
        name: "starboard",
        type: "SUB_COMMAND",
        description: "Choose a starboard channel.",
        options: [{
            name: "channel",
            type: "CHANNEL",
            description: "Specify channel."
        }, {
            name: "starlimit",
            type: "INTEGER",
            description: "Required amount of stars on a message.",
            minValue: 1
        }, {
            name: "disable",
            type: "BOOLEAN",
            description: "Disable starboard."
        }]
    }, {
        name: "log",
        type: "SUB_COMMAND",
        description: "Choose a channel to log to.",
        options: [{
            name: "channel",
            type: "CHANNEL",
            description: "Specify channel.",
            required: true
        }, {
            name: "disable",
            type: "BOOLEAN",
            description: "Disable logging."
        }]
    }, {
        name: "togglemod",
        type: "SUB_COMMAND",
        description: "Toggle automated moderation features."
    }, {
        name: "togglepersonalroles",
        type: "SUB_COMMAND",
        description: "Toggle personal roles in this server."
    }]
};