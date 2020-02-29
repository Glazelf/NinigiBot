module.exports = (client, member) => {
    const Discord = require("discord.js");
    const log = member.guild.channels.find(channel => channel.name === "log");

    // Import totals
    let globalVars = require('./ready');

    if (!log) return;
    user = client.users.get(member.id);

    const leaveEmbed = new Discord.RichEmbed()
        .setColor("#219DCD")
        .setAuthor(`Member joined ❤️`, user.avatarURL)
        .addField(`User:`, `<@${user.id}>`)
        .setFooter(`Welcome, ${user.username}!`)
        .setTimestamp();

    globalVars.totalLogs += 1;
    return log.send(leaveEmbed);
};