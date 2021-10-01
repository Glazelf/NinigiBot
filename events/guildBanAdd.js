module.exports = async (client, guildBan) => {
    const logger = require('../util/logger');
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

        let botMember = await guildBan.guild.members.fetch(client.user.id);

        if (log.permissionsFor(botMember).has("SEND_MESSAGES") && log.permissionsFor(botMember).has("EMBED_LINKS")) {
            let banEventTitle = await getLanguageString(client, language, 'banEventTitle');
            let guildMemberCountUpdate = await getLanguageString(client, language, 'guildMemberCountUpdate');
            guildMemberCountUpdate = guildMemberCountUpdate.replace('[guildName]', `**${guildBan.guild.name}**`).replace('[memberCount]', guildBan.guild.memberCount);
            let userTitle = await getLanguageString(client, language, 'userTitle');
            let reasonTitle = await getLanguageString(client, language, 'reasonTitle');
            let reasonUnspecified = await getLanguageString(client, language, 'reasonUnspecified');
            let executorTitle = await getLanguageString(client, language, 'executorTitle');

            const banLog = fetchedLogs.entries.first();
            if (!banLog) return;
            let executor;
            let target;
            let reason;
            if (banLog) {
                executor = banLog.executor;
                target = banLog.target;
                reason = banLog.reason;
            };
            if (!executor) return;
            if (reason == null) reason = reasonUnspecified;

            if (target.id !== guildBan.user.id) return;
            let avatarExecutor = executor.displayAvatarURL(globalVars.displayAvatarSettings);
            let avatarTarget = target.displayAvatarURL(globalVars.displayAvatarSettings);

            const banEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor(`${banEventTitle} 💔`, avatarExecutor)
                .setThumbnail(avatarTarget)
                .setDescription(guildMemberCountUpdate)
                .addField(userTitle, `${target} (${target.id})`, false)
                .addField(reasonTitle, reason, false)
                .addField(executorTitle, `${executor.tag} (${executor.id})`, false)
                .setFooter(target.tag)
                .setTimestamp();

            return log.send({ embeds: [banEmbed] });

        } else if (log.permissionsFor(botMember).has("SEND_MESSAGES") && !log.permissionsFor(botMember).has("EMBED_LINKS")) {
            let logBotPermissionError = await getLanguageString(client, language, 'logBotPermissionError');
            return log.send({ content: logBotPermissionError });
        } else {
            return;
        };

    } catch (e) {
        // Log error
        logger(e, client);
    };
};
