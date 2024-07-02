import { EmbedBuilder } from "discord.js";
import logger from "../util/logger.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };
import config from "../config.json" with { type: "json" };

export default async (client, guild) => {
    try {
        let log = await client.channels.fetch(config.devChannelID);
        if (!log) return;

        let icon = guild.iconURL(globalVars.displayAvatarSettings);
        let guildOwner = null;
        try {
            guildOwner = await guild.fetchOwner();
        } catch (e) {
            // console.log(e);
            return;
        };
        const guildEmbed = new EmbedBuilder()
            .setColor(globalVars.embedColor)
            .setTitle(`Guild Left ❌`)
            .setThumbnail(icon)
            .setDescription(`**${client.user.username}** is now in ${client.guilds.cache.size} servers.`)
            .setFooter({ text: guild.id })
            .setTimestamp()
            .addFields([{ name: `Name:`, value: guild.name, inline: true }]);
        if (guildOwner) guildEmbed.addFields([{ name: `Owner:`, value: `${guildOwner.user.username} (${guildOwner.id})`, inline: false }]);
        guildEmbed.addFields([{ name: `Users:`, value: guild.memberCount.toString(), inline: false }])
        return log.send({ embeds: [guildEmbed] });

    } catch (e) {
        logger({ exception: e, client: client });
    };
};