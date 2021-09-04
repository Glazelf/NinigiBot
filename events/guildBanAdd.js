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

        if (log.permissionsFor(botMember).has("SEND_MESSAGES") && log.permissionsFor(botMember).has("EMBED_LINKS")) {
            let banEventTitle = await getLanguageString(client, language, 'banEventTitle');
            let guildMemberCountUpdate = await getLanguageString(client, language, 'guildMemberCountUpdate');
            guildMemberCountUpdate = guildMemberCountUpdate.replace('[guildName]', `**${guildBan.guild.name}**`).replace('[memberCount]', guildBan.guild.memberCount);
            let userTitle = await getLanguageString(client, language, 'userTitle');
            let reasonTitle = await getLanguageString(client, language, 'reasonTitle');
            let reasonUnspecified = await getLanguageString(client, language, 'reasonUnspecified');
            let banExecutorTitle = await getLanguageString(client, language, 'banExecutorTitle');

            const banLog = fetchedLogs.entries.first();
            if (!banLog) return;
            let { executor, target, reason } = banLog;
            if (!executor) return;
            if (reason == null) reason = reasonUnspecified;
            let bannedBy = `${executor.tag} (${executor.id})`;

            if (target.id !== guildBan.user.id) return;
            let avatarExecutor = executor.displayAvatarURL({ format: "png", dynamic: true });
            let avatarTarget = target.displayAvatarURL({ format: "png", dynamic: true });

            const banEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor(`${banEventTitle} 💔`, avatarExecutor)
                .setThumbnail(avatarTarget)
                .setDescription(guildMemberCountUpdate)
                .addField(userTitle, `${target} (${target.id})`, false)
                .addField(reasonTitle, reason, false)
                .addField(banExecutorTitle, bannedBy, false)
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
        // log error
        const logger = require('../util/logger');

        logger(e, client);
    };
};
