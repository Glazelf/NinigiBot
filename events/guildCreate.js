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
        const guildEmbed = new Discord.EmbedBuilder()
            .setColor(globalVars.embedColor)
            .setAuthor({ name: `Guild Joined ⭐`, iconURL: icon })
            .setThumbnail(icon)
            .setDescription(`**${client.user.username}** is now in ${client.guilds.cache.size} servers.`)
            .addFields([{ name: `Name:`, value: guild.name, inline: true }]);
        if (guildOwner.user) guildEmbed.addFields([{ name: `Owner:`, value: `${guildOwner.user.username} (${guildOwner.id})`, inline: false }]);
        guildEmbed
            .addFields([{ name: `Users:`, value: guild.memberCount.toString(), inline: false }])
            .setFooter({ text: guild.id })
            .setTimestamp();
        return log.send({ embeds: [guildEmbed] });

    } catch (e) {
        // Log error
        logger(e, client);
    };
};