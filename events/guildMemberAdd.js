module.exports = (client, member) => {
    try {
        const Discord = require("discord.js");
        const log = member.guild.channels.cache.find(channel => channel.name === "log");

        // Import totals
        let globalVars = require('./ready');

        if (!log) return;
        user = client.users.cache.get(member.id);

        let avatar = null;
        if (user.avatarURL()) avatar = user.avatarURL({ format: "png", dynamic: true });

        const joinEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(`Member joined ❤️`, avatar)
            .setThumbnail(avatar)
            .addField(`User:`, user)
            .setFooter(`Welcome, ${user.tag}!`)
            .setTimestamp();

        globalVars.totalLogs += 1;
        return log.send(joinEmbed);

    } catch (e) {
        // log error
        let {logger} = require('./ready');
        logger(e);
    };
};
