module.exports = async (client, member) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('./ready');
    try {
        const getLanguageString = require('../util/getLanguageString');
        const Discord = require("discord.js");
        const { LogChannels, PersonalRoles, PersonalRoleServers, Languages } = require('../database/dbObjects');
        const checkDays = require('../util/checkDays');

        let logChannel = await LogChannels.findOne({ where: { server_id: member.guild.id } });
        if (!logChannel) return;
        let log = member.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        let dbLanguage = await Languages.findOne({ where: { server_id: member.guild.id } });
        let language = globalVars.language;
        if (dbLanguage) language = dbLanguage.language;

        let serverID = await PersonalRoleServers.findOne({ where: { server_id: member.guild.id } });
        let roleDB = await PersonalRoles.findOne({ where: { server_id: member.guild.id, user_id: member.id } });

        if (serverID && roleDB && !member.permissions.has("MANAGE_ROLES")) await deleteBoosterRole();

        let botMember = await member.guild.members.fetch(client.user.id);

        if (log.permissionsFor(botMember).has("SEND_MESSAGES") && log.permissionsFor(botMember).has("EMBED_LINKS")) {
            let memberLeaveEventTitle = await getLanguageString(client, language, 'memberLeaveEventTitle');
            let guildMemberCountUpdate = await getLanguageString(client, language, 'guildMemberCountUpdate');
            guildMemberCountUpdate = guildMemberCountUpdate.replace('[guildName]', `**${member.guild.name}**`).replace('[memberCount]', member.guild.memberCount);
            let userTitle = await getLanguageString(client, language, 'userTitle');
            let reasonTitle = await getLanguageString(client, language, 'reasonTitle');
            let reasonUnspecified = await getLanguageString(client, language, 'reasonUnspecified');
            let timeCreatedTitle = await getLanguageString(client, language, 'timeCreatedTitle');

            let kickEventTitle = await getLanguageString(client, language, 'kickEventTitle');
            let executorTitle = await getLanguageString(client, language, 'executorTitle');

            let avatar = member.user.displayAvatarURL(globalVars.displayAvatarSettings);
            let icon = member.guild.iconURL(globalVars.displayAvatarSettings);
            let memberLeaveObject = {};

            let embedAuthor = `${memberLeaveEventTitle} 💔`;
            let reasonText = reasonUnspecified;
            let kicked = false;
            let icon = member.guild.iconURL(globalVars.displayAvatarSettings);

            let leaveEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
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
                        embedAuthor = `${kickEventTitle} 💔`;
                    };
                };

                // Buttons
                let leaveButtons = new Discord.MessageActionRow()
                    .addComponents(new Discord.MessageButton({ label: 'Profile', style: 'LINK', url: `discord://-/users/${member.id}` }));

                leaveEmbed
                    .setAuthor(embedAuthor, icon)
                    .setThumbnail(avatar)
                    .addField(userTitle, `${member} (${member.id})`, false);
                if (daysJoined) leaveEmbed.addField("Joined:", `${member.joinedAt.toUTCString().substr(5,)}\n${daysJoined}`, true);
                leaveEmbed
                    .addField(timeCreatedTitle, `${member.user.createdAt.toUTCString().substr(5,)}\n${daysCreated}`, true)
                    .setFooter(member.user.tag);
                if (kicked == true) {
                    leaveEmbed.addField(reasonTitle, reasonText, false);
                    if (executor) leaveEmbed.addField(executorTitle, `${executor.tag} (${executor.id})`, false);
                };

                memberLeaveObject['components'] = [leaveButtons];
            };

            memberLeaveObject['embeds'] = [leaveEmbed];
            return log.send(memberLeaveObject);

        } else if (log.permissionsFor(botMember).has("SEND_MESSAGES") && !log.permissionsFor(botMember).has("EMBED_LINKS")) {
            let logBotPermissionError = await getLanguageString(client, language, 'logBotPermissionError');
            return log.send({ content: logBotPermissionError });
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