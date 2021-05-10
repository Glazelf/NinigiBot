module.exports = async (client, member) => {
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");
        const { LogChannels } = require('../database/dbObjects');
        let logChannel = await LogChannels.findOne({ where: { server_id: member.guild.id } });
        if (!logChannel) return;
        let log = member.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        let user = client.users.cache.get(member.id);

        let icon = member.guild.iconURL({ format: "png", dynamic: true });
        let avatar = user.displayAvatarURL({ format: "png", dynamic: true });

        const joinEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(`Member Joined ❤️`, icon)
            .setThumbnail(avatar)
            .setDescription(`${member.guild.name} now has ${member.guild.memberCount} members.`)
            .addField(`User: `, `${user} (${user.id})`)
            .setFooter(member.user.tag)
            .setTimestamp();

        return log.send(user, { embed: joinEmbed });

    } catch (e) {
        // log error
        const logger = require('../util/logger');

        logger(e, client);
    };
};
