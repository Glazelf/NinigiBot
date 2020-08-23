module.exports = (client, member) => {
    try {
        const Discord = require("discord.js");
        const log = member.guild.channels.cache.find(channel => channel.name === "log");

        // Import totals
        let globalVars = require('./ready');

        if (!log) return;
        user = client.users.cache.get(member.id);

        avatar = null;
        if (message.author.avatarURL()) avatar = message.author.avatarURL({ dynamic: true });

        const joinEmbed = new Discord.MessageEmbed()
            .setColor("#219DCD")
            .setAuthor(`Member joined ❤️`, avatar)
            .setThumbnail(avatar)
            .addField(`User:`, user)
            .setFooter(`Welcome, ${user.username}!`)
            .setTimestamp();

        globalVars.totalLogs += 1;
        return log.send(joinEmbed);

    } catch (e) {
        // log error
        console.log(e);
    };
};