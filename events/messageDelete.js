module.exports = async (client, message) => {
    const Discord = require("discord.js");
    const entry = await message.guild.fetchAuditLogs({ type: 'MESSAGE_DELETE' }).then(audit => audit.entries.first());
    const logs = message.guild.channels.find(channel => channel.name === "log");

    if (message.guild.me.hasPermission('MANAGE_CHANNELS') && !logs) {
        message.guild.createChannel('log', 'text');
        return message.channel.send(`> The log channel didn't exist yet, so I have created it for you, <@${message.author.id}>!`);
    };
    if (!message.guild.me.hasPermission('MANAGE_CHANNELS') && !logs) {
        return message.channel.send(`> The log channel does not exist and tried to create the channel but I am lacking permission to manage channels, <@${message.author.id}>.`);
    };
    
    let user;

    if (entry.extra.channel.id === message.channel.id
        && (entry.target.id === message.author.id)
        && (entry.createdTimestamp > (Date.now()))
        && (entry.extra.count >= 1)) {
        user = entry.executor;
    } else {
        user = message.author;
    };

    const deleteEmbed = new Discord.RichEmbed()
        .setColor("#FF0000")
        .setAuthor(`Message deleted`, user.avatarURL)
        .setDescription(`Message sent by ${message.author} deleted in <#${message.channel.id}>`)
        .addField(`Message content:`, `"${message.content}"`, false)
        .setFooter(`Deleted by ${user.tag}`)
        .setTimestamp();

    return logs.send(deleteEmbed);
};