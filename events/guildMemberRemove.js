module.exports = (client, member) => {
    const Discord = require("discord.js");
    const log = member.guild.channels.find(channel => channel.name === "log");

    // Import totals
    let globalVars = require('./ready');

    if (!log) return;
    user = client.users.get(member.id);

    const joinEmbed = new Discord.RichEmbed()
        .setColor("#219DCD")
        .setAuthor(`Member left 💔`, user.avatarURL)
        .addField(`User:`, `<@${user.id}>`)
        .setFooter(`We'll miss you, ${user.username}!`)
        .setTimestamp();


    globalVars.totalLogs += 1;
    return log.send(joinEmbed);
};