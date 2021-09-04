module.exports = async (client, member, newMember) => {
    // Import globals
    let globalVars = require('./ready');
    try {
        const getLanguageString = require('../util/getLanguageString');
        const Discord = require("discord.js");
        const { LogChannels, Languages } = require('../database/dbObjects');

        let logChannel = await LogChannels.findOne({ where: { server_id: member.guild.id } });
        if (!logChannel) return;
        let log = member.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        let dbLanguage = await Languages.findOne({ where: { server_id: guildBan.guild.id } });
        let language = globalVars.language;
        if (dbLanguage) language = dbLanguage.language;

        let botMember = await member.guild.members.fetch(client.user.id);

        if (log.permissionsFor(botMember).has("SEND_MESSAGES") && log.permissionsFor(botMember).has("EMBED_LINKS")) {
            let memberUpdateNicknameEventTitle = await getLanguageString(client, language, 'memberNicknameUpdateEventTitle');
            let guildBoostStartEventTitle = await getLanguageString(client, language, 'guildBoostStartEventTitle');
            let guildBoostStopEventTitle = await getLanguageString(client, language, 'guildBoostStopEventTitle');
            let userTitle = await getLanguageString(client, language, 'userTitle');
            let updateOldTitle = await getLanguageString(client, language, 'updateOldTitle');
            let updateNewTitle = await getLanguageString(client, language, 'updateNewTitle');
            let updateRemovedTitle = await getLanguageString(client, language, 'updateRemovedTitle');
            let guildBoostCountUpdate = await getLanguageString(client, language, 'guildBoostCountUpdate');
            guildBoostCountUpdate = guildBoostCountUpdate.replace('[guildName]', `**${member.guild.name}**`).replace('[boostCount]', member.guild.premiumSubscriptionCount);
            let guildBoostDecay = await getLanguageString(client, language, 'guildBoostDecay');
            guildBoostDecay = guildBoostDecay.replace('[guildName]', `**${member.guild.name}**`);

            let user = client.users.cache.get(member.id);
            let updateCase = null;
            let topText = null;
            let changeText = null;
            if (member.nickname !== newMember.nickname) updateCase = "nickname";
            if (!member.premiumSince && newMember.premiumSince) updateCase = "nitroStart";
            if (member.premiumSince && !newMember.premiumSince) updateCase = "nitroEnd";
            if (!updateCase) return;

            const { PersonalRoles, PersonalRoleServers } = require('../database/dbObjects');
            let serverID = await PersonalRoleServers.findOne({ where: { server_id: member.guild.id } });
            let roleDB = await PersonalRoles.findOne({ where: { server_id: member.guild.id, user_id: member.id } });
            if (!newMember.premiumSince && serverID && roleDB && !member.permissions.has("MANAGE_ROLES")) await deleteBoosterRole();

            let icon = member.guild.iconURL({ format: "png", dynamic: true });
            let avatar = user.displayAvatarURL({ format: "png", dynamic: true });

            switch (updateCase) {
                case "nickname":
                    topText = `${memberUpdateNicknameEventTitle} ⚒️`;
                    if (member.nickname && newMember.nickname) {
                        changeText = `${updateOldTitle} **${member.nickname}**\n${updateNewTitle} **${newMember.nickname}**`;
                    } else if (newMember.nickname) {
                        changeText = `${updateNewTitle} **${newMember.nickname}**`;
                    } else {
                        changeText = `${updateRemovedTitle} **${member.nickname}**`;
                    };
                    break;
                case "nitroStart":
                    topText = `${guildBoostStartEventTitle} ⚒️`;
                    changeText = guildBoostCountUpdate;
                    break;
                case "nitroEnd":
                    topText = `${guildBoostStopEventTitle} ⚒️`;
                    changeText = guildBoostDecay;
                    break;
                default:
                    return;
                    break;
            };

            const updateEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor(topText, icon)
                .setThumbnail(avatar)
                .setDescription(changeText)
                .addField(userTitle, `${user} (${user.id})`)
                .setFooter(user.tag)
                .setTimestamp();

            return log.send({ embeds: [updateEmbed] });

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
        // log error
        const logger = require('../util/logger');

        logger(e, client);
    };
};
