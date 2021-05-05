module.exports = async (client, guild, user) => {
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");
        const { LogChannels } = require('../database/dbObjects');
        let logChannel = await LogChannels.findOne({ where: { server_id: guild.id } });
        if (!logChannel) return;
        let log = guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        const fetchedLogs = await guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_BAN_ADD',
        });
        const banLog = fetchedLogs.entries.first();
        let { executor, target, reason } = banLog;
        let embedFooter = `${guild.name} now has ${guild.memberCount} members`;
        if (reason == null) reason = "Not specified.";
        let bannedBy = `${executor.tag} (${executor.id})`;

        if (target.id !== user.id) return;
        let avatarExecutor = executor.displayAvatarURL({ format: "png", dynamic: true });
        let avatarTarget = target.displayAvatarURL({ format: "png", dynamic: true });

        const banEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(`${target.username} banned 💔`, avatarExecutor)
            .setThumbnail(avatarTarget)
            .addField(`User:`, `${target} (${target.id})`, false)
            .addField(`Reason:`, reason, false)
            .addField(`Banned by:`, bannedBy, false)
            .setFooter(embedFooter)
            .setTimestamp();

        return log.send(banEmbed);

    } catch (e) {
        // log error
        const logger = require('../util/logger');

        logger(e, client);
    };
};
