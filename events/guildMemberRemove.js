module.exports = async (client, member) => {
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");
        const log = member.guild.channels.cache.find(channel => channel.name === "log");
        if (!log) return;

        let user = client.users.cache.get(member.id);
        let avatar = user.displayAvatarURL({ format: "png", dynamic: true });
        avatarExecutor = avatar;

        let embedAuthor = `Member Left 💔`;
        let embedFooter = `We'll miss you, ${user.tag}!`;

        const fetchedLogs = await member.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_KICK',
        });
        const kickLog = fetchedLogs.entries.first();

        if (kickLog) {
            if (kickLog.createdAt < member.joinedAt) return;
            const { executor, target } = kickLog;
            if (target.id !== member.id) return;
            avatarExecutor = executor.displayAvatarURL({ format: "png", dynamic: true });
            embedAuthor = `Member Kicked 💔`;
            embedFooter = `${target.tag} got kicked by ${executor.tag}`;
        };

        const leaveEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(embedAuthor, avatarExecutor)
            .setThumbnail(avatar)
            .addField(`User:`, `${user} (${user.id})`)
            .setFooter(embedFooter)
            .setTimestamp();

        globalVars.totalLogs += 1;
        return log.send(leaveEmbed);

    } catch (e) {
        // log error
        const logger = require('../util/logger');

        logger(e, client);
    };
};
