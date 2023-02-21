module.exports = async (client, member) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");
        const { LogChannels, PersonalRoles, PersonalRoleServers } = require('../database/dbServices/server.api');

        let logChannel = await LogChannels.findOne({ where: { server_id: member.guild.id } });
        if (!logChannel) return;
        let log = member.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        let serverID = await PersonalRoleServers.findOne({ where: { server_id: member.guild.id } });
        let roleDB = await PersonalRoles.findOne({ where: { server_id: member.guild.id, user_id: member.id } });
        if (serverID && roleDB && !member.permissions.has("MANAGE_ROLES")) await deleteBoosterRole();
        let botMember = member.guild.me;

        if (log.permissionsFor(botMember).has("SEND_MESSAGES") && log.permissionsFor(botMember).has("EMBED_LINKS")) {
            let memberLeaveObject = {};
            let embedAuthor = `Member Left 💔`;
            let reasonText = "Not specified.";
            let kicked = false;
            let icon = member.guild.iconURL(globalVars.displayAvatarSettings);

            let leaveEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setDescription(`**${member.guild.name}** now has ${member.guild.memberCount} members.`)
                .setTimestamp();

            if (member) {
                let avatar = member.user.displayAvatarURL(globalVars.displayAvatarSettings);
                const fetchedLogs = await member.guild.fetchAuditLogs({
                    limit: 1,
                    type: 'MEMBER_KICK',
                });
                let kickLog = fetchedLogs.entries.first();

                // Return if ban exists
                const banLogs = await member.guild.fetchAuditLogs({
                    limit: 1,
                    type: 'MEMBER_BAN_ADD',
                });
                if (kickLog && kickLog.createdTimestamp < (Date.now() - 5000)) kickLog = null;
                let banLog = banLogs.entries.first();
                if (banLog && banLog.createdTimestamp < (Date.now() - 5000) && member.id == banLog.target.id) return;
                if (kickLog && kickLog.createdAt > member.joinedAt) {
                    var { executor, target, reason } = kickLog;
                    if (target.id !== member.id) return;
                    kicked = true;
                    if (reason) reasonText = reason;
                    embedAuthor = `Member Kicked 💔`;
                };

                let leaveButtons = new Discord.MessageActionRow()
                    .addComponents(new Discord.MessageButton({ label: 'Profile', style: 'LINK', url: `discord://-/users/${member.id}` }));

                leaveEmbed
                    .setAuthor({ name: embedAuthor, iconURL: icon })
                    .setThumbnail(avatar)
                    .addField(`User: `, `${member} (${member.id})`, false);
                if (member.joinedAt) leaveEmbed.addField("Joined:", `<t:${Math.floor(member.joinedAt.valueOf() / 1000)}:f>`, true);
                leaveEmbed
                    .addField("Created:", `<t:${Math.floor(member.user.createdAt.valueOf() / 1000)}:f>`, true)
                    .setFooter({ text: member.user.tag });
                if (kicked == true) {
                    leaveEmbed.addField(`Reason:`, reasonText, false);
                    if (executor) leaveEmbed.addField(`Executor:`, `${executor.tag} (${executor.id})`, false);
                };

                memberLeaveObject['components'] = [leaveButtons];
            };

            memberLeaveObject['embeds'] = [leaveEmbed];
            return log.send(memberLeaveObject);

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