import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} from "discord.js";
import logger from "../util/logger.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };

export default async (client, member) => {
    try {
        let serverApi = await import("../database/dbServices/server.api.js");
        serverApi = await serverApi.default();
        let logChannel = await serverApi.LogChannels.findOne({ where: { server_id: member.guild.id } });
        if (!logChannel) return;
        let log = member.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        let botMember = member.guild.members.me;

        if (log.permissionsFor(botMember).has(PermissionFlagsBits.SendMessages) && log.permissionsFor(botMember).has(PermissionFlagsBits.EmbedLinks)) {
            let avatar = member.user.displayAvatarURL(globalVars.displayAvatarSettings);
            const profileButton = new ButtonBuilder()
                .setLabel("Profile")
                .setStyle(ButtonStyle.Link)
                .setURL(`discord://-/users/${member.id}`);
            let joinButtons = new ActionRowBuilder()
                .addComponents(profileButton);
            const joinEmbed = new EmbedBuilder()
                .setColor(globalVars.embedColor)
                .setTitle(`Member Joined ❤️`)
                .setThumbnail(avatar)
                .setDescription(`**${member.guild.name}** now has ${member.guild.memberCount} members.`)
                .setFooter({ text: member.user.username })
                .setTimestamp()
                .addFields([
                    { name: "User:", value: `${member} (${member.id})`, inline: false },
                    { name: "Created:", value: `<t:${Math.floor(member.user.createdAt.valueOf() / 1000)}:f>`, inline: true }
                ]);
            return log.send({ embeds: [joinEmbed], components: [joinButtons] });
        } else if (log.permissionsFor(botMember).has(PermissionFlagsBits.SendMessages) && !log.permissionsFor(botMember).has(PermissionFlagsBits.EmbedLinks)) {
            try {
                return log.send({ content: `I lack permissions to send embeds in ${log}.` });
            } catch (e) {
                // console.log(e);
                return;
            };
        } else {
            return;
        };

    } catch (e) {
        logger({ exception: e, client: client });
    };
};