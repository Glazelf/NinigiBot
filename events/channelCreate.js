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
                type: 'CHANNEL_CREATE',
            });
            const createLog = fetchedLogs.entries.first()
            let executor;
            if (createLog) {
                const { executor: createExecutor, target } = createLog;
                if (target.id === channel.id) {
                    executor = createExecutor;
                };
            };

            const channelType = getChannelTypeName(channel);

            const createEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor(`${channelType} Channel Created ⭐`)
                .addField(`Channel name:`, channel.name)
                .setFooter(channel.id)
                .setTimestamp();

            if (channel.parent) createEmbed.addField('Parent category:', channel.parent.name);
            if (executor) createEmbed.addField('Created by:', `${executor} (${executor.id})`);

            return log.send({ embeds: [createEmbed] });
        } else if (log.permissionsFor(botMember).has("SEND_MESSAGES") && !log.permissionsFor(botMember).has("EMBED_LINKS")) {
            return log.send({ content: `I lack permissions to send embeds in your log channel.` });
        } else {
            return;
        };

    } catch (e) {
        // Log error
        logger(e, client);
    }
}
