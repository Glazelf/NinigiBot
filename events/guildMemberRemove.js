module.exports = (client, member) => {
    try {
        const Discord = require("discord.js");
        const log = member.guild.channels.cache.find(channel => channel.name === "log");

        // Import totals
        let globalVars = require('./ready');

        if (!log) return;
        user = client.users.cache.get(member.id);

        let avatar = user.displayAvatarURL({ format: "png", dynamic: true });

        const leaveEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(`Member left 💔`, avatar)
            .setThumbnail(avatar)
            .addField(`User:`, user)
            .setFooter(`We'll miss you, ${user.tag}!`)
            .setTimestamp();

        globalVars.totalLogs += 1;
        return log.send(leaveEmbed);

    } catch (e) {
        // log error
        const logger = require('../util/logger');

        logger(e, client);
    };
};
