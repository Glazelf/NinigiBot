import Discord from "discord.js";
import logger from "../util/logger.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };

export default async (client, member, newMember) => {
    try {
        let serverApi = await import("../database/dbServices/server.api.js");
        serverApi = await serverApi.default();
        let logChannel = await serverApi.LogChannels.findOne({ where: { server_id: member.guild.id } });
        if (!logChannel) return;
        let log = member.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;
        let botMember = member.guild.members.me;

        if (log.permissionsFor(botMember).has(Discord.PermissionFlagsBits.SendMessages) && log.permissionsFor(botMember).has(Discord.PermissionFlagsBits.EmbedLinks)) {
            if (newMember) newMember = await newMember.fetch({ force: true });
            let user = await client.users.fetch(member.id);
            let oldAvatar = member.displayAvatarURL(globalVars.displayAvatarSettings);
            let avatar = newMember.displayAvatarURL(globalVars.displayAvatarSettings);

            let updateCase = null;
            let topText = null;
            let changeText = null;
            let image = null;
            if (!member.premiumSince && newMember.premiumSince) {
                // Nitro boost start
                updateCase = "nitroStart";
            } else if (member.premiumSince && !newMember.premiumSince) {
                // Nitro boost end
                updateCase = "nitroEnd";
            } else if (member.pending !== newMember.pending) {
                // Pending?
                updateCase = null;
            } else if (!member.communicationDisabledUntilTimestamp && newMember.communicationDisabledUntilTimestamp) {
                updateCase = "timeoutStart";
            } else if (member.communicationDisabledUntilTimestamp && !newMember.communicationDisabledUntilTimestamp) {
                updateCase = "timeoutEnd";
            } else if (member.guild !== newMember.guild || member.user !== newMember.user) {
                // I assume this does nothing but I want to be sure because of the weird nickname updates firing
                updateCase = null;
            } else if (oldAvatar !== avatar) {
                // Update server avatar
                updateCase = "guildAvatar";
            } else if (member.roles.cache.size !== newMember.roles.cache.size) {
                // Roles updated
                // Sometimes old member roles show 0. Not sure why? Might just be shortly after bot boots?
                updateCase = "rolesUpdate";
            } else if (member.nickname !== newMember.nickname) {
                // Nickname change
                updateCase = "nickname";
            };
            if (!updateCase) return;

            let fetchedLogs;
            let executor = null;
            try {
                fetchedLogs = await member.guild.fetchAuditLogs({
                    limit: 1,
                    type: Discord.AuditLogEvent.MemberUpdate
                });
                let memberUpdateLog = fetchedLogs.entries.first();
                if (memberUpdateLog) executor = memberUpdateLog.executor;
                if (executor.id == member.id || (memberUpdateLog && memberUpdateLog.createdTimestamp < (Date.now() - 5000))) executor = null;
            } catch (e) {
                // console.log(e);
                if (e.toString().includes("Missing Permissions")) executor = null;
            };

            let serverID = await serverApi.PersonalRoleServers.findOne({ where: { server_id: member.guild.id } });
            let roleDB = await serverApi.PersonalRoles.findOne({ where: { server_id: member.guild.id, user_id: member.id } });
            if (!newMember.premiumSince && serverID && roleDB && member.permissions && !member.permissions.has(Discord.PermissionFlagsBits.ManageRoles)) await deleteBoosterRole();

            switch (updateCase) {
                case "nickname":
                    topText = "Nickname Changed ⚒️";
                    if (member.nickname && newMember.nickname) {
                        changeText = `Old: **${member.nickname}**\nNew: **${newMember.nickname}**`;
                    } else if (newMember.nickname) {
                        changeText = `New: **${newMember.nickname}**`;
                    } else {
                        changeText = `Removed: **${member.nickname}**`;
                    };
                    break;
                case "nitroStart":
                    topText = "Started Nitro Boosting ⚒️";
                    changeText = `**${member.guild.name}** now has ${member.guild.premiumSubscriptionCount} Nitro Boosts.`;
                    break;
                case "nitroEnd":
                    topText = "Stopped Nitro Boosting ⚒️";
                    changeText = `**${member.guild.name}** will lose this Nitro Boost in 3 days.`;
                    break;
                case "guildAvatar":
                    topText = "Updated Server Avatar ⚒️";
                    image = avatar;
                    break;
                case "rolesUpdate":
                    let rolesSorted = [...member.roles.cache.values()].filter(element => element.name !== "@everyone").sort((r, r2) => r2.position - r.position);
                    let newRolesSorted = [...newMember.roles.cache.values()].filter(element => element.name !== "@everyone").sort((r, r2) => r2.position - r.position);
                    let rolesString = rolesSorted.join(", ");
                    let newRolesString = newRolesSorted.join(", ");
                    if (rolesString.length == 0) rolesString = "None";
                    if (newRolesString.length == 0) newRolesString = "None";
                    topText = "Roles Updated ⚒️";
                    changeText = `Roles for ${user.username} were changed.\nOld (${rolesSorted.length}): ${rolesString}\nNew (${newRolesSorted.length}): ${newRolesString}`;
                    break;
                case "timeoutStart":
                    topText = "Timed Out ⏸";
                    changeText = `Timed out untill <t:${Math.floor(newMember.communicationDisabledUntilTimestamp / 1000)}:F>.`;
                    break;
                case "timeoutEnd":
                    topText = "Timeout Ended ▶️";
                    break;
                default:
                    return;
            };
            if (changeText && changeText.length > 1024) changeText = changeText.slice(0, 1020) + "...";
            const updateEmbed = new Discord.EmbedBuilder()
                .setColor(globalVars.embedColor)
                .setTitle(topText)
                .setThumbnail(oldAvatar);
            if (changeText) updateEmbed.setDescription(changeText);
            updateEmbed.addFields([{ name: `User:`, value: `${user} (${user.id})`, inline: true }]);
            if (executor) updateEmbed.addFields([{ name: `Executor:`, value: `${executor} (${executor.id})`, inline: true }]);
            updateEmbed
                .setImage(image)
                .setFooter({ text: user.username })
                .setTimestamp();
            return log.send({ embeds: [updateEmbed] });

            async function deleteBoosterRole() {
                let oldRole = member.guild.roles.cache.find(r => r.id == roleDB.role_id);
                if (oldRole) {
                    try {
                        await oldRole.delete();
                    } catch (e) {
                        // console.log(e);
                    };
                };
                await roleDB.destroy();
            };

        } else if (log.permissionsFor(botMember).has(Discord.PermissionFlagsBits.SendMessages) && !log.permissionsFor(botMember).has(Discord.PermissionFlagsBits.EmbedLinks)) {
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
        logger(e, client);
    };
};
