import {
    EmbedBuilder,
    PermissionFlagsBits,
    AuditLogEvent,
    bold,
    time,
    TimestampStyles
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

        let serverID = await serverApi.PersonalRoleServers.findOne({ where: { server_id: member.guild.id } });
        let roleDB = await serverApi.PersonalRoles.findOne({ where: { server_id: member.guild.id, user_id: member.id } });
        if (serverID && roleDB) await deleteBoosterRole();
        let botMember = member.guild.members.me;

        if (log.permissionsFor(botMember).has(PermissionFlagsBits.SendMessages) && log.permissionsFor(botMember).has(PermissionFlagsBits.EmbedLinks)) {
            let memberLeaveObject = {};
            let embedAuthor = `Member Left 💔`;
            let reasonText = "Not specified.";
            let kicked = false;
            let leaveEmbed = new EmbedBuilder()
                .setColor(globalVars.embedColor)
                .setDescription(`${bold(member.guild.name)} now has ${member.guild.memberCount} members.`)
                .setTimestamp();
            if (member) {
                let avatar = member.user.displayAvatarURL(globalVars.displayAvatarSettings);
                const fetchedLogs = await member.guild.fetchAuditLogs({
                    limit: 1,
                    type: AuditLogEvent.MemberKick
                });
                let kickLog = fetchedLogs.entries.first();
                if (kickLog && kickLog.createdTimestamp < (Date.now() - 5000)) kickLog = null;
                // Ignore this log if user is banned, this avoids double logging on ban
                let bansFetch = null;
                try {
                    bansFetch = await member.guild.bans.fetch();
                } catch (e) {
                    // console.log(e);
                    bansFetch = null;
                };
                if (bansFetch && bansFetch.has(member.id)) return;

                let executor, target, reason;
                if (kickLog && kickLog.createdAt > member.joinedAt) {
                    executor = kickLog.executor;
                    target = kickLog.target;
                    reason = kickLog.reason;
                    if (target.id !== member.id) return;
                    kicked = true;
                    if (reason) reasonText = reason;
                    embedAuthor = `Member Kicked 💔`;
                };
                leaveEmbed
                    .setTitle(embedAuthor)
                    .setThumbnail(avatar)
                    .setFooter({ text: member.user.username })
                    .addFields([{ name: `User:`, value: `${member} (${member.id})`, inline: false }])
                    .addFields([{ name: "Created:", value: time(Math.floor(member.user.createdTimestamp / 1000), TimestampStyles.ShortDateTime), inline: true }]);
                if (member.joinedAt) leaveEmbed.addFields([{ name: "Joined:", value: time(Math.floor(member.joinedTimestamp / 1000), TimestampStyles.ShortDateTime), inline: true }]);
                if (kicked == true) {
                    leaveEmbed.addFields([{ name: `Reason:`, value: reasonText, inline: false }]);
                    if (executor) leaveEmbed.addFields([{ name: `Executor:`, value: `${executor.username} (${executor.id})`, inline: false }]);
                };
            };
            memberLeaveObject['embeds'] = [leaveEmbed];
            return log.send(memberLeaveObject);

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

        async function deleteBoosterRole() {
            let oldRole = member.guild.roles.cache.find(r => r.id == roleDB.role_id);
            if (oldRole) await oldRole.delete();
            await roleDB.destroy();
        };

    } catch (e) {
        logger({ exception: e, client: client });
    };
};