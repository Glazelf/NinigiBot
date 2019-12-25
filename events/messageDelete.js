module.exports = async (client, message) => {
    const Discord = require("discord.js");
    const entry = await message.guild.fetchAuditLogs({ type: 'MESSAGE_DELETE' }).then(audit => audit.entries.first());
    const log = message.guild.channels.find(channel => channel.name === "log");

    if(message.content == "") return;

    //// Limit log to only Sinnoh and Glaze server
    // let SinnohServer = Boolean(message.guild.id == "517008998445350922");
    // let GlazeServer = Boolean(message.guild.id == "549214833858576395");
    // if (!SinnohServer && !GlazeServer) return;

    //// Make log channel if doesn't exist yet
    // if (message.guild.me.hasPermission('MANAGE_CHANNELS') && !log) {
    //     message.guild.createChannel('log', 'text');
    //     return message.channel.send(`> The log channel didn't exist yet, so I have created it for you, <@${message.author.id}>!`);
    // };
    // if (!message.guild.me.hasPermission('MANAGE_CHANNELS') && !log) {
    //     return message.channel.send(`> The log channel does not exist yet, so I tried to create the channel but I am lacking permission to manage channels, <@${message.author.id}>.`);
    // };

    if(!log) return;
    
    let user;

    if (entry.extra.channel.id === message.channel.id
        && (entry.target.id === message.author.id)
        && (entry.createdTimestamp > (Date.now() - 5000))
        && (entry.extra.count >= 1)) {
        user = entry.executor;
    } else {
        user = message.author;
    };

    const deleteEmbed = new Discord.RichEmbed()
        .setColor("#219DCD")
        .setAuthor(`Message deleted ❌`, user.avatarURL)
        .setDescription(`Message sent by ${message.author} deleted in <#${message.channel.id}>.`)
        .addField(`Message content:`, `"${message.content}"`, false)
        .setFooter(`Deleted by ${user.tag}`)
        .setTimestamp();

    return log.send(deleteEmbed);
};