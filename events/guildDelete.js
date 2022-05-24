module.exports = async (client, guild) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");

        let log = client.channels.fetch(client.config.devChannelID);
        if (!log) return;

        let icon = guild.iconURL(globalVars.displayAvatarSettings);
        let guildOwner = await guild.fetchOwner();

        const guildEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor({ name: `Guild Left ❌`, iconURL: icon })
            .setThumbnail(icon)
            .setDescription(`${guild.name}`);
        if (guildOwner) guildEmbed.addField(`Owner:`, `${guildOwner.tag} (${guildOwner.id})`, true);
        guildEmbed
            .addField(`Users:`, guild.memberCount.toString(), true)
            .setFooter({ text: guild.id })
            .setTimestamp();

        return log.send({ embeds: [guildEmbed] });

    } catch (e) {
        // Log error
        logger(e, client);
    };
};