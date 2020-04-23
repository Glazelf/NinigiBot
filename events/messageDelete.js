module.exports = async (client, message) => {
    try {
        const Discord = require("discord.js");
        const entry = await member.guild.fetchAuditLogs({
            limit: 1,
            type: 'MESSAGE_DELETE',
        });
        const log = message.guild.channels.get(channel => channel.name === "log");
        if (!log) return;

        // Import totals
        let globalVars = require('./ready');

        let user;

        if (entry.extra.channel.id === message.channel.id
            && (entry.target.id === message.author.id)
            && (entry.createdTimestamp > (Date.now() - 5000))
            && (entry.extra.count >= 1)) {
            user = entry.executor;
        } else {
            user = message.author;
        };

        const deleteEmbed = new Discord.MessageEmbed()
            .setColor("#219DCD")
            .setAuthor(`Message deleted ❌`, message.author.avatarURL())
            .setDescription(`Message sent by ${message.author} deleted in <#${message.channel.id}>.`)
            .addField(`Message content:`, message.content, false)
            .setFooter(`Deleted by ${user.tag}`)
            .setTimestamp();

        globalVars.totalLogs += 1;
        return log.send(deleteEmbed);

    } catch (e) {
        // log error
        console.log(e);
    };
};