module.exports = async (client, member) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");
        const { LogChannels, PersonalRoles, PersonalRoleServers } = require('../database/dbObjects');
        const checkDays = require('../util/checkDays');

        let logChannel = await LogChannels.findOne({ where: { server_id: member.guild.id } });
        if (!logChannel) return;
        let log = member.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        let serverID = await PersonalRoleServers.findOne({ where: { server_id: member.guild.id } });
        let roleDB = await PersonalRoles.findOne({ where: { server_id: member.guild.id, user_id: member.id } });

        if (serverID && roleDB && !member.permissions.has("MANAGE_ROLES")) await deleteBoosterRole();

        let botMember = await member.guild.members.fetch(client.user.id);

        if (log.permissionsFor(botMember).has("SEND_MESSAGES") && log.permissionsFor(botMember).has("EMBED_LINKS")) {
            let memberLeaveObject = {};

            let embedAuthor = `Member Left 💔`;
            let reasonText = "Not specified.";
            let kicked = false;
            let icon = member.guild.iconURL(globalVars.displayAvatarSettings);

            let leaveEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor(embedAuthor, icon)
                .setDescription(`**${member.guild.name}** now has ${member.guild.memberCount} members.`)
                .setTimestamp();

            if (member) {
                let avatar = member.user.displayAvatarURL(globalVars.displayAvatarSettings);

                // Check Days
                let daysJoined = null;
                if (member.joinedAt) daysJoined = await checkDays(member.joinedAt);
                let daysCreated = await checkDays(member.user.createdAt);

                const fetchedLogs = await member.guild.fetchAuditLogs({
                    limit: 1,
                    type: 'MEMBER_KICK',
                });
                const kickLog = fetchedLogs.entries.first();

                if (kickLog) {
                    if (kickLog.createdAt > member.joinedAt) {
                        var { executor, target, reason } = kickLog;
                        if (target.id !== member.id) return;
                        kicked = true;
                        if (reason) reasonText = reason;
                        embedAuthor = `Member Kicked 💔`;
                    };
                };

                // Buttons
                let leaveButtons = new Discord.MessageActionRow()
                    .addComponents(new Discord.MessageButton({ label: 'Profile', style: 'LINK', url: `discord://-/users/${member.id}` }));

                leaveEmbed
                    .setThumbnail(avatar)
                    .addField(`User: `, `${member} (${member.id})`, false);
                if (daysJoined) leaveEmbed.addField("Joined:", `${member.joinedAt.toUTCString().substr(5,)}\n${daysJoined}`, true);
                leaveEmbed
                    .addField("Created:", `${member.user.createdAt.toUTCString().substr(5,)}\n${daysCreated}`, true)
                    .setFooter(member.user.tag);
                if (kicked == true) {
                    leaveEmbed.addField(`Reason:`, reasonText, false);
                    if (executor) leaveEmbed.addField(`Executor:`, `${executor.tag} (${executor.id})`, false);
                };

                memberLeaveObject['components'] = [leaveButtons];
            };

            memberLeaveObject['embeds'] = [leaveEmbed];
            return log.send(memberLeaveObject);

        } else if (log.permissionsFor(botMember).has("SEND_MESSAGES") && !log.permissionsFor(botMember).has("EMBED_LINKS")) {
            return log.send({ content: `I lack permissions to send embeds in your log channel.` });
        } else {
            return;
        };

        async function deleteBoosterRole() {
            let oldRole = member.guild.roles.cache.find(r => r.id == roleDB.role_id);
            if (oldRole) await oldRole.delete();
            await roleDB.destroy();
        };

    } catch (e) {
        // Log error
        logger(e, client);
    };
};