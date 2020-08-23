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

        const leaveEmbed = new Discord.MessageEmbed()
            .setColor("#219DCD")
            .setAuthor(`Member left 💔`,avatar)
            .setThumbnail(avatar)
            .addField(`User:`, user)
            .setFooter(`We'll miss you, ${user.username}!`)
            .setTimestamp();

        globalVars.totalLogs += 1;
        return log.send(leaveEmbed);

    } catch (e) {
        // log error
        console.log(e);
    };
};