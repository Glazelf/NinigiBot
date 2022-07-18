module.exports = async (client, guild) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");

        let log = await client.channels.fetch(client.config.devChannelID);
        if (!log) return;

        let icon = guild.iconURL(globalVars.displayAvatarSettings);
        let guildOwner = await guild.fetchOwner();

        const guildEmbed = new Discord.EmbedBuilder()
            .setColor(globalVars.embedColor)
            .setAuthor({ name: `Guild Joined ⭐`, iconURL: icon })
            .setThumbnail(icon)
            .setDescription(`${guild.name}`);
        if (guildOwner.user) guildEmbed.addField(`Owner:`, `${guildOwner.user.tag} (${guildOwner.id})`, false);
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