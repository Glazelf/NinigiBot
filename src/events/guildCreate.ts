import {
    EmbedBuilder
} from "discord.js";
import logger from "../util/logger.js";
import formatName from "../util/discord/formatName.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };

export default async (client, guild) => {
    try {
        let log = await client.channels.fetch(process.env.DEV_CHANNEL_ID);
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
            .setColor(globalVars.embedColor as [number, number, number])
            .setTitle(`Guild Joined ⭐`)
            .setThumbnail(icon)
            .setDescription(`${formatName(client.user.username, true)} is now in ${client.guilds.cache.size} servers.`)
            .setFooter({ text: `ID: ${guild.id}` })
            .setTimestamp()
            .addFields([{ name: `Name:`, value: formatName(guild.name, false), inline: true }]);
        if (guildOwner.user) guildEmbed.addFields([{ name: `Owner:`, value: `${formatName(guildOwner.user.username, false)} (${guildOwner.id})`, inline: false }]);
        guildEmbed.addFields([{ name: `Members:`, value: guild.memberCount.toString(), inline: false }])
        return log.send({ embeds: [guildEmbed] });

    } catch (e) {
        logger({ exception: e, client: client });
    };
};