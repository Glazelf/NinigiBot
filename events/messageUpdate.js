module.exports = async (client, message, oldMessage, newMessage) => {
    try {
        const Discord = require("discord.js");
        const entry = await message.guild.fetchAuditLogs({ type: 'MESSAGE_UPDATE' }).then(audit => audit.entries.first());
        const log = message.guild.channels.find(channel => channel.name === "log");

        // Import totals
        let globalVars = require('./ready');

        if (message.content == "") return;
        if (message.content === oldMessage.content) return;
        if (message.channel.id == "549220763341815808") return; //Glazesdump

        if (!log) return;

        let user = message.author;

        const updateEmbed = new Discord.RichEmbed()
            .setColor("#219DCD")
            .setAuthor(`Message edited ⚒️`, user.avatarURL)
            .setDescription(`Message sent by ${message.author} edited in <#${message.channel.id}>.`)
            //Why does oldMessage return the newMessage, does newMessage not exist and does message return the old message?
            .addField(`Before:`, message.content, false)
            .addField(`After:`, oldMessage.content, false)
            .addField(`Jump to message:`, `[Link](https://discordapp.com/channels/${message.guild.id}/${message.channel.id}/${message.id})`, false)
            .setFooter(`Edited by ${user.tag}`)
            .setTimestamp();

        globalVars.totalLogs += 1;
        return log.send(updateEmbed);
        
    } catch (e) {
        // log error
        console.log(e);
    };
};