module.exports = async (client, member) => {
    // Import globals
    let globalVars = require('./ready');
    try {
        const getLanguageString = require('../util/getLanguageString');
        const Discord = require("discord.js");
        const { LogChannels, Languages } = require('../database/dbObjects');
        const checkDays = require('../util/checkDays');

        let logChannel = await LogChannels.findOne({ where: { server_id: member.guild.id } });
        if (!logChannel) return;
        let log = member.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        let dbLanguage = await Languages.findOne({ where: { server_id: member.guild.id } });
        let language = globalVars.language;
        if (dbLanguage) language = dbLanguage.language;

        let botMember = await member.guild.members.fetch(client.user.id);

        if (log.permissionsFor(botMember).has("SEND_MESSAGES") && log.permissionsFor(botMember).has("EMBED_LINKS")) {
            let memberJoinEventTitle = await getLanguageString(client, language, 'memberJoinEventTitle');
            let guildMemberCountUpdate = await getLanguageString(client, language, 'guildMemberCountUpdate');
            guildMemberCountUpdate = guildMemberCountUpdate.replace('[guildName]', `**${member.guild.name}**`).replace('[memberCount]', member.guild.memberCount);
            let userTitle = await getLanguageString(client, language, 'userTitle');
            let timeCreatedTitle = await getLanguageString(client, language, 'timeCreatedTitle');

            let user = client.users.cache.get(member.id);

            let icon = member.guild.iconURL({ format: "png", dynamic: true });
            let avatar = user.displayAvatarURL({ format: "png", dynamic: true });

            // Language = en as a test for now untill proper translation 
            let language = 'en';
            let daysCreated = await checkDays(client, user.createdAt, language);

            const joinEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor(`${memberJoinEventTitle} ❤️`, icon)
                .setThumbnail(avatar)
                .setDescription(guildMemberCountUpdate)
                .addField(userTitle, `${user} (${user.id})`)
                .addField(timeCreatedTitle, `${user.createdAt.toUTCString().substr(5,)}\n${daysCreated}`, true)
                .setFooter(member.user.tag)
                .setTimestamp();

            return log.send({ content: user.toString(), embeds: [joinEmbed] });
        } else if (log.permissionsFor(botMember).has("SEND_MESSAGES") && !log.permissionsFor(botMember).has("EMBED_LINKS")) {
            let logBotPermissionError = await getLanguageString(client, language, 'logBotPermissionError');
            return log.send({ content: logBotPermissionError });
        } else {
            return;
        };

    } catch (e) {
        // log error
        const logger = require('../util/logger');

        logger(e, client);
    };
};
