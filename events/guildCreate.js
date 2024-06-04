import Discord from "discord.js";
import logger from "../util/logger.js";

export default async (client, guild) => {
    try {
        let log = await client.channels.fetch(client.config.devChannelID);
        if (!log) return;

        let icon = guild.iconURL(client.globalVars.displayAvatarSettings);
        let guildOwner = null;
        try {
            guildOwner = await guild.fetchOwner();
        } catch (e) {
            // console.log(e);
            return;
        };
        const guildEmbed = new Discord.EmbedBuilder()
            .setColor(client.globalVars.embedColor)
            .setTitle(`Guild Joined ⭐`)
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
        logger(e, client);
    };
};