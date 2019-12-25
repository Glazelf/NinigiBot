module.exports = async (client, message, oldMessage, newMessage) => {
    const Discord = require("discord.js");
    const entry = await message.guild.fetchAuditLogs({ type: 'MESSAGE_UPDATE' }).then(audit => audit.entries.first());
    const log = message.guild.channels.find(channel => channel.name === "log");

    if(message.content == "") return;

    if(!log) return;
    
    let user = entry.author;

    const updateEmbed = new Discord.RichEmbed()
        .setColor("#219DCD")
        .setAuthor(`Message edited ⚒️`, user.avatarURL)
        .setDescription(`Message sent by ${message.author} edited in <#${message.channel.id}>.`)
        .addField(`Before:`, `"${oldMessage.content}"`, false)
        .addField(`After:`, `"${message.content}"`, false)
        .addField(`Jump to message:`, `[Link](https://discordapp.com/channels/${message.guild.id}/${message.channel.id}/${message.id})`, false)
        .setFooter(`Edited by ${user.tag}`)
        .setTimestamp();

    return log.send(updateEmbed);
};