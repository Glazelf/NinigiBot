import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits,
    AuditLogEvent
} from "discord.js";
import logger from "../util/logger.js";
import formatName from "../util/discord/formatName.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };


export default async (client, guildBan) => {
    try {
        let serverApi = await import("../database/dbServices/server.api.js");
        serverApi = await serverApi.default();
        let logChannel = await serverApi.LogChannels.findOne({ where: { server_id: guildBan.guild.id } });
        if (!logChannel) return;
        let log = guildBan.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        const fetchedLogs = await guildBan.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.MemberBanAdd
        });

        let botMember = guildBan.guild.members.me;

        if (log.permissionsFor(botMember).has(PermissionFlagsBits.SendMessages) && log.permissionsFor(botMember).has(PermissionFlagsBits.EmbedLinks)) {
            let banLog = fetchedLogs.entries.first();
            if (banLog && banLog.createdTimestamp < (Date.now() - 5000)) banLog = null;
            if (!banLog) return;
            let executor = banLog.executor;
            let target = banLog.target;
            let reason = banLog.reason;
            if (!executor || !target) return;
            if (reason == null) reason = "Not specified.";
            if (target.id !== guildBan.user.id) return;

            // let avatarExecutor = executor.displayAvatarURL(globalVars.displayAvatarSettings);
            let avatarTarget = target.displayAvatarURL(globalVars.displayAvatarSettings);

            const profileButton = new ButtonBuilder()
                .setLabel("Profile")
                .setStyle(ButtonStyle.Link)
                .setURL(`discord://-/users/${target.id}`);
            let banButtons = new ActionRowBuilder()
                .addComponents(profileButton);
            const banEmbed = new EmbedBuilder()
                .setColor(globalVars.embedColor)
                .setTitle(`Member Banned 💔`)
                .setThumbnail(avatarTarget)
                .setDescription(`${formatName(guildBan.guild.name)} now has ${guildBan.guild.memberCount} members.`)
                .setFooter({ text: target.username })
                .setTimestamp()
                .addFields([
                    { name: `User:`, value: `${target} (${target.id})`, inline: false },
                    { name: `Reason:`, value: reason, inline: false },
                    { name: `Executor:`, value: `${executor} (${executor.id})`, inline: false }
                ]);
            return log.send({ embeds: [banEmbed], components: [banButtons] });

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