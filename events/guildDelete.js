module.exports = async (client, guild) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");

        let log = await client.channels.fetch(client.config.devChannelID);
        if (!log) return;

        let icon = guild.iconURL(globalVars.displayAvatarSettings);
        let guildOwner = null;
        try {
            guildOwner = await guild.fetchOwner();
        } catch (e) {
            // console.log(e);
            return;
        };

        const guildEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor({ name: `Guild Left ❌`, iconURL: icon })
            .setThumbnail(icon)
            .setDescription(`**${client.user.username}** is now in ${client.guilds.cache.size} servers.`)
            .addField(`Name:`, guild.name, true);
        if (guildOwner) guildEmbed.addField(`Owner:`, `${guildOwner.user.username} (${guildOwner.id})`, false);
        guildEmbed
            .addField(`Users:`, guild.memberCount.toString(), false)
            .setFooter({ text: guild.id })
            .setTimestamp();

        return log.send({ embeds: [guildEmbed] });

    } catch (e) {
        // Log error
        logger(e, client);
    };
};