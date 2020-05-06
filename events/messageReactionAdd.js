module.exports = (reaction, user, message) => {
    try {
        const Discord = require("discord.js");
        let starboard = reaction.message.guild.channels.find(channel => channel.name === "starboard");

        if (!starboard) return;

        // Import totals
        let globalVars = require('./ready');

        if (message.content == "") return;
        if (message.content === oldMessage.content) return;
        if (message.channel.id == "549220763341815808") return; //Glazesdump

        if (!log) return;

        const starEmbed = new Discord.MessageEmbed()
            .setColor("#219DCD")
            .setAuthor(`${message.author.username} :star:`, message.author.avatarURL())
            .setDescription(message.content)
            //Why does oldMessage return the newMessage, does newMessage not exist and does message return the old message?
            .addField(`Before:`, message.content, false)
            .addField(`Jump to message:`, `[Link](https://discordapp.com/channels/${message.guild.id}/${message.channel.id}/${message.id})`, false)
            .setFooter(`Edited by ${message.author.tag}`)
            .setTimestamp();

        globalVars.totalLogs += 1;
        return starboard.send(starEmbed);

    } catch (e) {
        // log error
        console.log(e);
    };
};