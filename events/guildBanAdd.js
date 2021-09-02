module.exports = async (client, guildBan) => {
    // Import globals
    let globalVars = require('./ready');
    try {
        const getLanguageString = require('../util/getLanguageString');
        const Discord = require("discord.js");
        const { LogChannels, Languages } = require('../database/dbObjects');
        let logChannel = await LogChannels.findOne({ where: { server_id: guildBan.guild.id } });
        if (!logChannel) return;
        let log = guildBan.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        let dbLanguage = await Languages.findOne({ where: { server_id: guildBan.guild.id } });
        let language = globalVars.language;
        if (dbLanguage) language = dbLanguage.language;

        const fetchedLogs = await guildBan.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_BAN_ADD',
        });

        const banLog = fetchedLogs.entries.first();
        if (!banLog) return;
        let { executor, target, reason } = banLog;
        if (!executor) return;
        if (reason == null) reason = "Not specified.";
        let bannedBy = `${executor.tag} (${executor.id})`;

        if (target.id !== guildBan.user.id) return;
        let avatarExecutor = executor.displayAvatarURL({ format: "png", dynamic: true });
        let avatarTarget = target.displayAvatarURL({ format: "png", dynamic: true });

        const banEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(`Member Banned 💔`, avatarExecutor)
            .setThumbnail(avatarTarget)
            .setDescription(`**${guildBan.guild.name}** now has ${guildBan.guild.memberCount} members.`)
            .addField(`User:`, `${target} (${target.id})`, false)
            .addField(`Reason:`, reason, false)
            .addField(`Banned by:`, bannedBy, false)
            .setFooter(target.tag)
            .setTimestamp();

        return log.send({ embeds: [banEmbed] });

    } catch (e) {
        // log error
        const logger = require('../util/logger');

        logger(e, client);
    };
};
