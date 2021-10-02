module.exports = async (client, channel) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");
        const { LogChannels } = require('../database/dbObjects');

        let logChannel = await LogChannels.findOne({ where: { server_id: channel.guild.id } });
        if (!logChannel) return;
        let log = channel.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        let botMember = await channel.guild.members.fetch(client.user.id);

        if (log.permissionsFor(botMember).has("SEND_MESSAGES") && log.permissionsFor(botMember).has("EMBED_LINKS")) {
            const getChannelTypeName = require('../util/getChannelType');
            const fetchedLogs = await channel.guild.fetchAuditLogs({
                limit: 1,
                type: 'CHANNEL_DELETE',
            });
            const deleteLog = fetchedLogs.entries.first();
            let executor;
            if (deleteLog) {
                const { executor: createExecutor, target } = deleteLog;
                if (target.id === channel.id) {
                    executor = createExecutor;
                };
            };

            const channelType = getChannelTypeName(channel);

            let footer = newChannel.id;
            if (executor) footer = executor.tag;

            const deleteEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor(`${channelType} Channel Deleted ❌`)
                .addField(`Channel:`, channel.name)
                .setFooter(footer)
                .setTimestamp();

            if (executor) deleteEmbed.addField('Deleted by:', `${executor} (${executor.id})`);

            return log.send({ embeds: [deleteEmbed] });
        } else if (log.permissionsFor(botMember).has("SEND_MESSAGES") && !log.permissionsFor(botMember).has("EMBED_LINKS")) {
            return log.send({ content: `I lack permissions to send embeds in your log channel.` });
        } else {
            return;
        };

    } catch (e) {
        // Log error
        logger(e, client);
    };
};
