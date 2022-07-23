module.exports = async (client, member) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");
        const { LogChannels } = require('../database/dbServices/attatchments.api');

        let logChannel = await LogChannels.findOne({ where: { server_id: member.guild.id } });
        if (!logChannel) return;
        let log = member.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        let botMember = await member.guild.members.fetch(client.user.id);

        if (log.permissionsFor(botMember).has("SEND_MESSAGES") && log.permissionsFor(botMember).has("EMBED_LINKS")) {
            let icon = member.guild.iconURL(globalVars.displayAvatarSettings);
            let avatar = member.user.displayAvatarURL(globalVars.displayAvatarSettings);

            let joinButtons = new Discord.MessageActionRow()
                .addComponents(new Discord.MessageButton({ label: 'Profile', style: 'LINK', url: `discord://-/users/${member.id}` }));

            const joinEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor({ name: `Member Joined ❤️`, iconURL: icon })
                .setThumbnail(avatar)
                .setDescription(`**${member.guild.name}** now has ${member.guild.memberCount} members.`)
                .addField(`User: `, `${member} (${member.id})`, false)
                .addField("Created:", `<t:${Math.floor(member.user.createdAt.valueOf() / 1000)}:f>`, true)
                .setFooter({ text: member.user.tag })
                .setTimestamp();

            return log.send({ embeds: [joinEmbed], components: [joinButtons] });
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