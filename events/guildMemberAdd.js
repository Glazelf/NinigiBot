module.exports = async (client, member) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");
        const { LogChannels } = require('../database/dbServices/server.api');

        let logChannel = await LogChannels.findOne({ where: { server_id: member.guild.id } });
        if (!logChannel) return;
        let log = member.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        let botMember = member.guild.members.me;

        if (log.permissionsFor(botMember).has(Discord.PermissionFlagsBits.SendMessages) && log.permissionsFor(botMember).has(Discord.PermissionFlagsBits.EmbedLinks)) {
            let icon = member.guild.iconURL(globalVars.displayAvatarSettings);
            let avatar = member.user.displayAvatarURL(globalVars.displayAvatarSettings);
            let joinButtons = new Discord.ActionRowBuilder()
                .addComponents(new Discord.ButtonBuilder({ label: 'Profile', style: Discord.ButtonStyle.Link, url: `discord://-/users/${member.id}` }));
            const joinEmbed = new Discord.EmbedBuilder()
                .setColor(globalVars.embedColor)
                .setAuthor({ name: `Member Joined ❤️`, iconURL: icon })
                .setThumbnail(avatar)
                .setDescription(`**${member.guild.name}** now has ${member.guild.memberCount} members.`)
                .addFields([
                    { name: "User:", value: `${member} (${member.id})`, inline: false },
                    { name: "Created:", value: `<t:${Math.floor(member.user.createdAt.valueOf() / 1000)}:f>`, inline: true }
                ])
                .setFooter({ text: member.user.username })
                .setTimestamp();
            return log.send({ embeds: [joinEmbed], components: [joinButtons] });
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
        // Log error
        logger(e, client);
    };
};