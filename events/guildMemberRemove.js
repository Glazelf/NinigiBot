module.exports = async (client, member) => {
    // Import globals
    let globalVars = require('./ready');
    try {
        const getLanguageString = require('../util/getLanguageString');
        const Discord = require("discord.js");
        const { LogChannels, PersonalRoles, PersonalRoleServers, Languages } = require('../database/dbObjects');

        let logChannel = await LogChannels.findOne({ where: { server_id: member.guild.id } });
        if (!logChannel) return;
        let log = member.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        let dbLanguage = await Languages.findOne({ where: { server_id: guildBan.guild.id } });
        let language = globalVars.language;
        if (dbLanguage) language = dbLanguage.language;

        let serverID = await PersonalRoleServers.findOne({ where: { server_id: member.guild.id } });
        let roleDB = await PersonalRoles.findOne({ where: { server_id: member.guild.id, user_id: member.id } });

        if (serverID && roleDB && !member.permissions.has("MANAGE_ROLES")) await deleteBoosterRole();

        let botMember = await member.guild.members.fetch(client.user.id);
        if (log.permissionsFor(botMember).has("SEND_MESSAGES") && log.permissionsFor(botMember).has("EMBED_LINKS")) {
            let avatar = member.user.displayAvatarURL({ format: "png", dynamic: true });
            let icon = member.guild.iconURL({ format: "png", dynamic: true });

            let embedAuthor = `Member Left 💔`;
            let reasonText = "Not specified.";
            let kicked = false;

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
                    icon = executor.displayAvatarURL({ format: "png", dynamic: true });
                    embedAuthor = `Member Kicked 💔`;
                };
            };

            const leaveEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor(embedAuthor, icon)
                .setThumbnail(avatar)
                .setDescription(`**${member.guild.name}** now has ${member.guild.memberCount} members.`)
                .addField(`User: `, `${member} (${member.id})`, false);
            if (kicked == true) {
                leaveEmbed.addField(`Reason:`, reasonText, false)
                try {
                    leaveEmbed.addField(`Kicked by:`, `${executor.tag} (${executor.id})`, false);
                } catch (e) {
                    // console.log(e);
                };
            };
            leaveEmbed
                .setFooter(member.user.tag)
                .setTimestamp();

            return log.send({ embeds: [leaveEmbed] });
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
        // log error
        const logger = require('../util/logger');

        logger(e, client);
    };
};
