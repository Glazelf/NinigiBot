import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits,
    time,
    TimestampStyles
} from "discord.js";
import type { ExtendedClient } from '../types/global.js';
import logger from "../util/logger.js";
import formatName from "../util/discord/formatName.js";
import checkPermissions from "../util/discord/perms/checkPermissions.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };

export default async (client: ExtendedClient, member) => {
    try {
        let serverApi: any = await import("../database/dbServices/server.api.js");
        serverApi = await serverApi.default() as any;
        let logChannel = await serverApi.LogChannels.findOne({ where: { server_id: member.guild.id } });
        if (!logChannel) return;
        let log = member.guild.channels.cache.get(logChannel.channel_id);
        if (!log) return;

        let botMember = member.guild.members.me;
        if (checkPermissions({ member: botMember, channel: log, permissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks] })) {
            let avatar = member.user.displayAvatarURL(globalVars.displayAvatarSettings);
            const profileButton = new ButtonBuilder()
                .setLabel("Profile")
                .setStyle(ButtonStyle.Link)
                .setURL(`discord://-/users/${member.id}`);
            let joinButtons = new ActionRowBuilder()
                .addComponents(profileButton);
            const joinEmbed = new EmbedBuilder()
                .setColor(globalVars.embedColor as [number, number, number])
                .setTitle(`Member Joined ❤️`)
                .setThumbnail(avatar)
                .setDescription(`${formatName(member.guild.name, true)} now has ${member.guild.memberCount} members.`)
                .setFooter({ text: `ID: ${member.id}` })
                .setTimestamp()
                .addFields([
                    { name: "User:", value: `${member} (${member.user.username})`, inline: false },
                    { name: "Created:", value: time(Math.floor(member.user.createdTimestamp / 1000), TimestampStyles.ShortDate), inline: true }
                ]);
            return log.send({ embeds: [joinEmbed], components: [joinButtons] as any });
        } else if (checkPermissions({ member: botMember, channel: log, permissions: [PermissionFlagsBits.SendMessages] }) && !checkPermissions({ member: botMember, channel: log, permissions: [PermissionFlagsBits.EmbedLinks] })) {
            try {
                return log.send({ content: `I lack permissions to send embeds in ${log}.` });
            } catch (e: any) {
                // console.log(e);
                return;
            };
        } else {
            return;
        };

    } catch (e: any) {
        logger({ exception: e, client: client });
    };
};