module.exports = async (client, member) => {
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");
        const { LogChannels } = require('../database/dbObjects');
        let logChannel = await LogChannels.findOne({ where: { server_id: member.guild.id } });
        if (!logChannel) return;
        let log = member.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        let user = client.users.cache.get(member.id);
        let avatar = user.displayAvatarURL({ format: "png", dynamic: true });
        let icon = member.guild.iconURL({ format: "png", dynamic: true });

        let embedAuthor = `Member Left 💔`;
        let embedFooter = `${member.guild.name} now has ${member.guild.memberCount} members`;
        let reasonText = "Not specified.";
        let kicked = false;
        let kickedBy;

        const fetchedLogs = await member.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_KICK',
        });
        const kickLog = fetchedLogs.entries.first();

        if (kickLog) {
            if (kickLog.createdAt > member.joinedAt) {
                let { executor, target, reason } = kickLog;
                if (target.id !== member.id) return;
                kicked = true;
                if (reason) reasonText = reason;
                icon = executor.displayAvatarURL({ format: "png", dynamic: true });
                embedAuthor = `Member Kicked 💔`;
                kickedBy = `${target.tag} got kicked by ${executor.tag}.`;
            };
        };

        const leaveEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(embedAuthor, icon)
            .setThumbnail(avatar)
            .addField(`User: `, `${user} (${user.id})`, false);
        if (kickLog && kicked == true) leaveEmbed.addField(`Kicked:`, reasonText, false);
        if (kickedBy) leaveEmbed.addField(`Kicked by:`, `${executor.tag} (${execturo.id})`, false);
        leaveEmbed
            .setFooter(embedFooter)
            .setTimestamp();

        return log.send(leaveEmbed);

    } catch (e) {
        // log error
        const logger = require('../util/logger');

        logger(e, client);
    };
};
