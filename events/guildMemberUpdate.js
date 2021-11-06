module.exports = async (client, member, newMember) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");
        const { LogChannels } = require('../database/dbObjects');

        let logChannel = await LogChannels.findOne({ where: { server_id: member.guild.id } });
        if (!logChannel) return;
        let log = member.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        let botMember = await member.guild.members.fetch(client.user.id);

        if (log.permissionsFor(botMember).has("SEND_MESSAGES") && log.permissionsFor(botMember).has("EMBED_LINKS")) {
            let user = await client.users.fetch(member.id);

            let icon = member.guild.iconURL(globalVars.displayAvatarSettings);
            let oldAvatar = member.displayAvatarURL(globalVars.displayAvatarSettings);
            let avatar = newMember.displayAvatarURL(globalVars.displayAvatarSettings);

            let updateCase = null;
            let topText = null;
            let changeText = null;
            let image = null;
            if (member.nickname !== newMember.nickname) updateCase = "nickname";
            if (!member.premiumSince && newMember.premiumSince) updateCase = "nitroStart";
            if (member.premiumSince && !newMember.premiumSince) updateCase = "nitroEnd";
            if (oldAvatar !== avatar) updateCase = "guildAvatar";
            if (!updateCase) return;

            let fetchedLogs
            let executor;
            try {
                fetchedLogs = await member.guild.fetchAuditLogs({
                    limit: 1,
                    type: 'MEMBER_UPDATE',
                });
                let memberUpdateLog = fetchedLogs.entries.first();
                if (memberUpdateLog) executor = memberUpdateLog.executor;
                if (executor.id == member.id || memberUpdateLog.createdTimestamp < (Date.now() - 5000)) executor = null;
            } catch (e) {
                // console.log(e);
                if (e.toString().includes("Missing Permissions")) executor = null;
            };

            const { PersonalRoles, PersonalRoleServers } = require('../database/dbObjects');
            let serverID = await PersonalRoleServers.findOne({ where: { server_id: member.guild.id } });
            let roleDB = await PersonalRoles.findOne({ where: { server_id: member.guild.id, user_id: member.id } });
            if (!newMember.premiumSince && serverID && roleDB && !member.permissions.has("MANAGE_ROLES")) await deleteBoosterRole();

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
                default:
                    return;
            };

            const updateEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor(topText, icon)
                .setThumbnail(oldAvatar);
            if (changeText) updateEmbed.setDescription(changeText);
            updateEmbed
                .addField(`User:`, `${user} (${user.id})`);
            if (executor) updateEmbed.addField(`Executor:`, `${executor} (${executor.id})`);
            updateEmbed
                .setImage(image)
                .setFooter(user.tag)
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

        } else if (log.permissionsFor(botMember).has("SEND_MESSAGES") && !log.permissionsFor(botMember).has("EMBED_LINKS")) {
            try {
                return log.send({ content: `I lack permissions to send embeds in your log channel.` });
            } catch (e) {
                // console.log(e);
                return;
            };
        } else {
            return;
        };

    } catch (e) {
        // Log error
        logger(e, client);
    };
};
