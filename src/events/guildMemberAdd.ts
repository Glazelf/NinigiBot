import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits,
    time,
    TimestampStyles
} from "discord.js";
import logger from "../util/logger.js";
import formatName from "../util/discord/formatName.js";

import globalVars from "../objects/globalVars.json";

export default async (client: any, member: any) => {
    try {
        let serverApi = await import("../database/dbServices/server.api.js");
        // @ts-expect-error TS(2741): Property 'default' is missing in type '{ shinxQuot... Remove this comment to see the full error message
        serverApi = await serverApi.default();
        // @ts-expect-error TS(2339): Property 'LogChannels' does not exist on type 'typ... Remove this comment to see the full error message
        let logChannel = await serverApi.LogChannels.findOne({ where: { server_id: member.guild.id } });
        if (!logChannel) return;
        let log = member.guild.channels.cache.get(logChannel.channel_id);
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
                .setColor(globalVars.embedColor as ColorResolvable)
                .setTitle(`Member Joined ❤️`)
                .setThumbnail(avatar)
                .setDescription(`${formatName(member.guild.name)} now has ${member.guild.memberCount} members.`)
                .setFooter({ text: member.user.username })
                .setTimestamp()
                .addFields([
                    { name: "User:", value: `${member} (${member.id})`, inline: false },
                    { name: "Created:", value: time(Math.floor(member.user.createdTimestamp / 1000), TimestampStyles.ShortDateTime), inline: true }
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