import {
    EmbedBuilder,
    PermissionFlagsBits,
    AuditLogEvent,
    time,
    TimestampStyles
} from "discord.js";
import logger from "../util/logger.js";
import deletePersonalRole from "../util/db/deletePersonalRole.js";
import formatName from "../util/discord/formatName.js";
import getBotSubscription from "../util/discord/getBotSubscription.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };

export default async (client, oldMember, newMember) => {
    try {
        let serverApi = await import("../database/dbServices/server.api.js");
        serverApi = await serverApi.default();
        let logChannel = await serverApi.LogChannels.findOne({ where: { server_id: oldMember.guild.id } });
        if (!logChannel) return;
        let log = oldMember.guild.channels.cache.get(logChannel.channel_id);
        if (!log) return;
        let botMember = oldMember.guild.members.me;

        if (log.permissionsFor(botMember).has(PermissionFlagsBits.SendMessages) && log.permissionsFor(botMember).has(PermissionFlagsBits.EmbedLinks)) {
            if (newMember) {
                let newMemberFetch = await newMember.fetch({ force: true }).catch(e => { return; });
                if (newMemberFetch) newMember = newMemberFetch;
            };
            if (!newMember) return;
            let oldAvatar = oldMember.avatarURL(globalVars.displayAvatarSettings);
            let avatar = newMember.avatarURL(globalVars.displayAvatarSettings);
            let displayAvatar = newMember.displayAvatarURL(globalVars.displayAvatarSettings);
            let oldBanner = oldMember.bannerURL(globalVars.displayAvatarSettings);
            let banner = newMember.bannerURL(globalVars.displayAvatarSettings);

            let updateCase = null;
            let topText = null;
            let changeText = null;
            let image = null;
            if (!oldMember.premiumSince && newMember.premiumSince) {
                // Nitro boost start
                updateCase = "nitroStart";
            } else if (oldMember.premiumSince && !newMember.premiumSince) {
                // Nitro boost end
                updateCase = "nitroEnd";
            } else if (oldMember.pending !== newMember.pending) {
                // Pending?
                updateCase = null;
            } else if (!oldMember.communicationDisabledUntilTimestamp && newMember.communicationDisabledUntilTimestamp) {
                updateCase = "timeoutStart";
            } else if (oldMember.communicationDisabledUntilTimestamp && !newMember.communicationDisabledUntilTimestamp) {
                updateCase = "timeoutEnd";
            } else if (oldMember.guild !== newMember.guild || oldMember.user !== newMember.user) {
                // I assume this does nothing but I want to be sure because of the weird nickname updates firing
                updateCase = null;
            } else if (oldAvatar !== avatar) {
                // Update server avatar
                updateCase = "guildAvatar";
            } else if (oldBanner !== banner) {
                // Update server banner
                updateCase = "guildBanner";
            } else if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
                // Roles updated
                // Sometimes old member roles show 0. Not sure why? Might just be shortly after bot boots?
                updateCase = "rolesUpdate";
            } else if (oldMember.nickname !== newMember.nickname) {
                // Nickname change
                updateCase = "nickname";
            };
            if (!updateCase) return;

            let fetchedLogs;
            let executor = null;
            try {
                fetchedLogs = await oldMember.guild.fetchAuditLogs({
                    limit: 1,
                    type: AuditLogEvent.MemberUpdate
                });
                let memberUpdateLog = fetchedLogs.entries.first();
                if (memberUpdateLog) executor = memberUpdateLog.executor;
                if (executor.id == oldMember.id || (memberUpdateLog && memberUpdateLog.createdTimestamp < (Date.now() - 5000))) executor = null;
            } catch (e) {
                // console.log(e);
                if (e.toString().includes("Missing Permissions")) executor = null;
            };

            if (!newMember.premiumSince && newMember.permissions && !newMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
                let serverID = await serverApi.PersonalRoleServers.findOne({ where: { server_id: oldMember.guild.id } });
                let roleDB = await serverApi.PersonalRoles.findOne({ where: { server_id: oldMember.guild.id, user_id: oldMember.id } });
                let isSupporter = false;
                let botSubscription = await getBotSubscription(client.application, newMember.id);
                if (newMember.guild.id == globalVars.ShinxServerID && botSubscription.entitlement) isSupporter = true;
                let integrationRoleBool = newMember.roles.cache.some(role => role.tags?.integrationId);
                if (serverID && roleDB && !isSupporter && !integrationRoleBool) await deletePersonalRole(roleDB, oldMember.guild);
            };

            switch (updateCase) {
                case "nickname":
                    topText = "Nickname Changed ⚒️";
                    if (oldMember.nickname && newMember.nickname) {
                        changeText = `Old: ${formatName(oldMember.nickname, true)}\nNew: ${formatName(newMember.nickname, true)}`;
                    } else if (newMember.nickname) {
                        changeText = `New: ${formatName(newMember.nickname, true)}`;
                    } else {
                        changeText = `Removed: ${formatName(oldMember.nickname, true)}`;
                    };
                    break;
                case "nitroStart":
                    topText = "Started Nitro Boosting ⚒️";
                    changeText = `${formatName(oldMember.guild.name, true)} now has ${oldMember.guild.premiumSubscriptionCount} Nitro Boosts.`;
                    break;
                case "nitroEnd":
                    topText = "Stopped Nitro Boosting ⚒️";
                    changeText = `${formatName(oldMember.guild.name, true)} will lose this Nitro Boost in 3 days.`;
                    break;
                case "guildAvatar":
                    topText = "Updated Server Avatar ⚒️";
                    image = avatar;
                    break;
                case "guildBanner":
                    topText = "Updated Server Banner ⚒️";
                    image = banner;
                    break;
                case "rolesUpdate":
                    let rolesSorted = [...oldMember.roles.cache.values()].filter(element => element.name !== "@everyone").sort((r, r2) => r2.position - r.position);
                    let newRolesSorted = [...newMember.roles.cache.values()].filter(element => element.name !== "@everyone").sort((r, r2) => r2.position - r.position);
                    let rolesString = rolesSorted.join(", ");
                    let newRolesString = newRolesSorted.join(", ");
                    if (rolesString.length == 0) rolesString = "None";
                    if (newRolesString.length == 0) newRolesString = "None";
                    topText = "Roles Updated ⚒️";
                    changeText = `Roles for ${formatName(oldMember.user.username, true)} were changed.\nOld (${rolesSorted.length}): ${rolesString}\nNew (${newRolesSorted.length}): ${newRolesString}`;
                    break;
                case "timeoutStart":
                    topText = "Timed Out ⏸";
                    changeText = `Timed out untill ${time(Math.floor(newMember.communicationDisabledUntilTimestamp / 1000), TimestampStyles.LongDateTime)}.`;
                    break;
                case "timeoutEnd":
                    topText = "Timeout Ended ▶️";
                    break;
                default:
                    return;
            };
            if (changeText && changeText.length > 1024) changeText = changeText.slice(0, 1020) + "...";
            const updateEmbed = new EmbedBuilder()
                .setColor(globalVars.embedColor)
                .setTitle(topText)
                .setThumbnail(displayAvatar)
                .setImage(image)
                .setFooter({ text: oldMember.user.username })
                .setTimestamp();
            if (changeText) updateEmbed.setDescription(changeText);
            updateEmbed.addFields([{ name: `User:`, value: `${oldMember} (${oldMember.id})`, inline: true }]);
            if (executor) updateEmbed.addFields([{ name: `Executor:`, value: `${executor} (${executor.id})`, inline: true }]);
            return log.send({ embeds: [updateEmbed] });

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