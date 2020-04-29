module.exports = async (client, message) => {
    try {
        const Discord = require("discord.js");
        const entry = await message.member.guild.fetchAuditLogs({
            limit: 1,
            type: 'MESSAGE_DELETE',
        });
        
        const log = message.guild.channels.cache.find(channel => channel.name === "log");
        if (!log) return;

        // Import totals
        let globalVars = require('./ready');

        let user = entry.executor;
        if (!user) {
            user = message.author;
        };

        if (!message.content) {
            message.content = "None";
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