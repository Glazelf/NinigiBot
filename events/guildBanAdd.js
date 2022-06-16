module.exports = async (client, guildBan) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");
        const { LogChannels } = require('../database/dbObjects');

        let logChannel = await LogChannels.findOne({ where: { server_id: guildBan.guild.id } });
        if (!logChannel) return;
        let log = guildBan.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        const fetchedLogs = await guildBan.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_BAN_ADD',
        });

        let botMember = await guildBan.guild.members.fetch(client.user.id);

        if (log.permissionsFor(botMember).has("SEND_MESSAGES") && log.permissionsFor(botMember).has("EMBED_LINKS")) {
            let banLog = fetchedLogs.entries.first();
            if (banLog && banLog.createdTimestamp < (Date.now() - 5000)) banLog = null;
            if (!banLog) return;
            let executor = null;
            let target = null;
            let reason = null;
            if (banLog) {
                executor = banLog.executor;
                target = banLog.target;
                reason = banLog.reason;
            };
            if (!executor || !target) return;
            if (reason == null) reason = "Not specified.";
            if (target.id !== guildBan.user.id) return;

            let avatarExecutor = executor.displayAvatarURL(globalVars.displayAvatarSettings);
            let avatarTarget = target.displayAvatarURL(globalVars.displayAvatarSettings);

            let banButtons = new Discord.MessageActionRow()
                .addComponents(new Discord.MessageButton({ label: 'Profile', style: 'LINK', url: `discord://-/users/${target.id}` }));

            const banEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor({ name: `Member Banned 💔`, iconURL: avatarExecutor })
                .setThumbnail(avatarTarget)
                .setDescription(`**${guildBan.guild.name}** now has ${guildBan.guild.memberCount} members.`)
                .addField(`User:`, `${target} (${target.id})`, false)
                .addField(`Reason:`, reason, false)
                .addField(`Executor:`, `${executor.tag} (${executor.id})`, false)
                .setFooter({ text: target.tag })
                .setTimestamp();

            return log.send({ embeds: [banEmbed], components: [banButtons] });

        } else if (log.permissionsFor(botMember).has("SEND_MESSAGES") && !log.permissionsFor(botMember).has("EMBED_LINKS")) {
            try {
                return log.send({ content: `I lack permissions to send embeds in your log channel.` });
            } catch (e) {
                // console.log(e);
                return;
            };
        } else {
            return;
        };

    } catch (e) {
        // Log error
        logger(e, client);
    };
};