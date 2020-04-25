module.exports = (client, member) => {
    try {
        const Discord = require("discord.js");
        const log = member.guild.channels.cache.find(channel => channel.name === "log");

        // Import totals
        let globalVars = require('./ready');

        if (!log) return;
        user = client.users.cache.get(member.id);

        const leaveEmbed = new Discord.MessageEmbed()
            .setColor("#219DCD")
            .setAuthor(`Member joined ❤️`, user.avatarURL())
            .addField(`User:`, `<@${user.id}>`)
            .setFooter(`Welcome, ${user.username}!`)
            .setTimestamp();

        globalVars.totalLogs += 1;
        return log.send(leaveEmbed);
    } catch (e) {
        // log error
        console.log(e);
    };
};